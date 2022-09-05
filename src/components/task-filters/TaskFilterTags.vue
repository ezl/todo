<template>
  <div class="relative">
    <button @click="toggle" :class="dynamicClassList" class="w-8 h-8 flex justify-center items-center bg-lotion dark:bg-dark-gunmetal text-primary">
      <tag-outline-icon :size="23" />
    </button>
    <div v-if="open" class="list p-4 bg-lotion dark:bg-dark-gunmetal absolute rounded-sm">
      <Tag v-for="tag in filteredTags" :key="tag.id" :tag="tag" @clearable="unselectTag(tag)" class="item px-3 py-1 table" />
    </div>
  </div>
</template>

<script>
import TagOutlineIcon from 'vue-material-design-icons/TagOutline';
import TagModel from '@/models/Tag';
import Setting from '@/models/Setting';
import { isUtcDateInFuture } from '@/helpers/datetime';
import Tag from '@/components/tags/Tag';

export default {
  components: {
    TagOutlineIcon,
    Tag
  },
  data() {
    return {
      open: false
    };
  },
  computed: {
    tags() {
      let tags = TagModel.query()
        .with('items', query => {
          // Exclude discarded, snoozed & incomplete items
          query
            .where('completed_at', null)
            .where('discarded_at', null)
            .where('snoozed_until', value => value === null || isUtcDateInFuture(value) === false);
        })
        .get();

      tags = TagModel.orderTags(tags);

      return tags;
    },
    filteredTags() {
      let tags = this.tags.filter(tag => {
        if (this.settings.hide_tags_without_items && !tag.items.length) return false;

        return true;
      });

      return tags;
    },
    selectedTagsCount() {
      let count = this.tags.filter(tag => tag.toggled).length

      return count;
    },
    settings() {
      return Setting.query().first();
    },
    dynamicClassList() {
      const classList = []

      if(this.selectedTagsCount || this.open){
        classList.push('!bg-primary !text-white')
      }

      return classList
    },
  },
  methods: {
    toggle() {
      this.open = !this.open;
    }
  },
  mounted() {
    // Close it when user clicks outside of this
    document.body.addEventListener('click', e => {
      if (this.$el.contains(e.target)) return;
      // Ignore if the el that was clicked is longer part of the DOM
      if (! document.body.contains(e.target)) return;
    
      this.open = false
    });
  }
};
</script>

<style scoped>
.list {
  width: 350px;
  margin-top: 5px;
  z-index: 5;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
</style>
