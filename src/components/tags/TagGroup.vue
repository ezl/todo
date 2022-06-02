<template>
  <div>
    <div class="flex flex-wrap tags-wrapper">
      <Tag v-for="tag in tags" :key="tag.id" :tag="tag" />
    </div>
  </div>
</template>

<script>
import Tag from '@/components/tags/Tag';
import TagModel from '@/models/Tag';
import Setting from '@/models/Setting';

export default {
  components: {
    Tag
  },
  computed: {
    tags() {
      let tags = TagModel.getOrderedTags()

      tags = tags.filter(tag => {
        if (this.settings.hide_tags_without_items) {
          const notCompletedItems = tag.items.filter(item => item.completed_at === null)
          if (!notCompletedItems.length) return false;
        }

        return true;
      });

      return tags
    },
    settings() {
      return Setting.query().first();
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
