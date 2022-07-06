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
import moment from 'moment';

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
        .where('snoozed_until', value => {
          if(value === null) return true

          const now =  moment.utc()
          const snoozeEndDate = moment.utc(value)

          return snoozeEndDate.isSameOrBefore(now)
        })
      })
      .get()

      tags = TagModel.orderTags(tags)

      tags = tags.filter(tag => {
        if (this.settings.hide_tags_without_items && !tag.items.length) return false;

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
