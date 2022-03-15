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

export default {
  components: {
    Tag,
  },
  data() {
    return {};
  },
  computed: {
    tags() {
      return TagModel.query()
        .has('items')
        .get();
    }
  },
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
