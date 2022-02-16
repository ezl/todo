<template>
  <ul id="tags-suggestion-popup" class=" shadow-md absolute bg-lotion dark:bg-dark-gunmetal rounded-md overflow-hidden" :style="style">
    <li v-if="!tags.length && query != '#'">
      <span class="flex flex items-center uppercase px-4 py-1 text-sm">Create tag</span>
      <span @click="createTag" class="px-4 py-1 cursor-pointer flex items-center bg-bright-gray dark:bg-dark-charcoal text-black dark:text-white">
        {{ query }}
      </span>
    </li>
    <li
      v-for="(tag, index) in tags"
      :key="index"
      @click="onSelectTag(tag)"
      :class="getDynamicClassList(index)"
      class="cursor-pointer px-4 py-1 flex items-center text-black dark:text-white"
    >
      {{ tag.name }}
    </li>
  </ul>
</template>

<script>
import Tag from '@/models/Tag';

export default {
  props: {
    x: {
      required: true,
      type: Number
    },
    y: {
      required: true,
      type: Number
    },
    query: {
      required: true,
      type: String
    },
    tags: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      offsetY: 30
    };
  },
  computed: {
    style() {
      return {
        left: `${this.x}px`,
        top: `${this.y + this.offsetY}px`
      };
    }
  },
  methods: {
    onSelectTag(tag) {
      this.$emit('select', tag);
    },
    async createTag() {
      const tag = await Tag.add(this.query);
      this.onSelectTag(tag);
    },
    getDynamicClassList(index) {
      if (index == 0) {
        return ['bg-bright-gray', 'dark:bg-dark-charcoal'];
      }
      return ['hover:bg-bright-gray', 'dark:hover:bg-dark-charcoal'];
    }
  }
};
</script>

<style>
#tags-suggestion-popup {
  width: 300px;
}
</style>
