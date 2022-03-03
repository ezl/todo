<template>
  <div>
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" class="flex flex-wrap tags-wrapper">
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
  methods: {
    onMouseEnter() {
      document.querySelector('.tag-settings-btn').classList.add('!visible');
    },
    onMouseLeave() {
      document.querySelector('.tag-settings-btn').classList.remove('!visible');
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
