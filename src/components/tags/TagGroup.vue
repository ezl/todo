<template>
  <div class="flex flex-wrap">
    <Tag @click="onTagClicked(tag)" v-for="tag in tags" :key="tag.id" :tag="tag" :selected="isSelected(tag)"/>
  </div>
</template>

<script>
import Tag from '@/components/tags/tag';
import TagModel from '@/models/Tag';

export default {
  components: {
    Tag
  },
  data() {
    return {
      selectedTagsIds: []
    };
  },
  computed: {
    tags() {
      return TagModel.query().has('items').get();
    }
  },
  methods: {
    onTagClicked(tag) {
      if (this.selectedTagsIds.includes(tag.id)) {
        this.selectedTagsIds = this.selectedTagsIds.filter(id => id != tag.id);
      } else {
        this.selectedTagsIds.push(tag.id);
      }

      this.$emit('select', this.selectedTagsIds)
    },
    isSelected(tag) {
      if (this.selectedTagsIds.includes(tag.id)) return true;

      return false;
    }
  }
};
</script>
