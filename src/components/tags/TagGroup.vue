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
      let tags = TagModel.query()
        .with('items')
        .get();

      tags = tags.sort((a, b) => {
        if(this.settings.sort_tags_by === 'alphabetical_order') return a.name.localeCompare(b.name)
        
        if(this.settings.sort_tags_by === 'usage_frequency') return b.items.length - a.items.length
  
        if(this.settings.sort_tags_by === 'oldest') {
          const d1 = new Date(a.created_at) 
          const d2 = new Date(b.created_at) 
      
          return d1.getTime() - d2.getTime() 
        }
      })

      tags = tags.filter(tag => {
        if (this.settings.hide_tags_without_items) {
          if (!tag.items.length) return false;
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
