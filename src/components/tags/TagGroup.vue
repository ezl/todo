<template>
  <div>
    <div class="flex flex-wrap tags-wrapper">
      <Tag v-for="tag in filteredTags" :key="tag.id" :tag="tag" />
    </div>
  </div>
</template>

<script>
import Tag from '@/components/tags/Tag';
import TagModel from '@/models/Tag';
import Setting from '@/models/Setting';
import { isUtcDateInFuture } from '@/helpers/datetime';

export default {
  components: {
    Tag
  },
  computed: {
    tags() {
      let tags = TagModel.query().with('items', (query) => {
        // Exclude discarded, snoozed & incomplete items
        query
        .where('completed_at', null)
        .where('discarded_at', null)
        .where('snoozed_until', value => value === null || isUtcDateInFuture(value) === false)
      })
      .get()

      tags = TagModel.orderTags(tags)

      return tags
    },
    filteredTags(){
      let tags = this.tags.filter(tag => {
        if (this.settings.hide_tags_without_items && !tag.items.length) return false;

        return true;
      });

      return tags
    },
    settings() {
      return Setting.query().first();
    }
  },
  methods: {
    async HandleUnselectingTagsWithNoActiveTasks(){
      for (let index = 0; index < this.tags.length; index++) {
        const tag = this.tags[index];

        if(tag.items.length || !tag.toggled) continue

        tag.toggled = false
        await tag.$save()
        
        console.log(`${tag.name} has no active items`, tag.toggled)

      }
    }
  },
  watch: {
    tags: {
      handler: function(newVal){
        this.HandleUnselectingTagsWithNoActiveTasks()
      }
    }
  }
};
</script>

<style scoped>
.tags-wrapper {
  transition: opacity 0.7s;
  opacity: 100%;
}
.tags-wrapper.hide {
  opacity: 0;
}
</style>
