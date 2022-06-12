<template>
  <ul id="tags-suggestion-popup" class=" shadow-md absolute bg-lotion dark:bg-dark-gunmetal rounded-md overflow-hidden" :style="style">
    <li v-if="showCreationButton" class="tag-suggestion">
      <span class="flex flex items-center uppercase px-4 py-1 text-sm">Create tag</span>
      <span @click="onSelectTag" class="px-4 py-1 cursor-pointer flex items-center bg-bright-gray dark:bg-dark-charcoal text-black dark:text-white">
        {{ query }}
      </span>
    </li>
    <li
      v-for="(tag, index) in tags"
      :key="index"
      @click="onSelectTag(index)"
      :class="getDynamicClassList(index)"
      class="cursor-pointer px-4 py-1 flex items-center text-black dark:text-white tag-suggestion"
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
    },
    foundExactMatch(){
      const tag = this.tags[0]

      if(tag) return tag.name.toLowerCase() === this.query.toLowerCase()

      return false
    },
    showCreationButton(){
      if(!this.foundExactMatch && this.query != '#') return true

      return false
    }
  },
  methods: {
    async onSelectTag(index = 0) {
      let tag = this.tags[index]

      if(!tag) {
        tag = await Tag.add(this.query);
      }

      this.$emit('select', tag);
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
  z-index: 999;
}
</style>
