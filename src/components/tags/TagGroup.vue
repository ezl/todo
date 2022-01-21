<template>
  <div class="flex">
    <Tag v-for="(tag, index) in tags" :key="index" :tag="tag" />
  </div>
</template>

<script>
import Tag from '@/components/tags/tag';

export default {
  components: {
    Tag
  },
  data() {
    return {
      tags: ['#web3', 'programming', '#webdev', 'cryptocurrency']
    };
  }
};
</script>
