<template>
  <ul class="bg-lotion dark:bg-dark-gunmetal z-20 p-3 text-xs w-48">
    <li class="mb-1 text-secondary">Colors</li>
    <li @click="onColorPicked(tag, color.hexValue)" v-for="(color, index) in colors" :key="index" class="flex items-center justify-between mt-3 cursor-pointer">
      <div class="flex items-center">
        <span class="w-5 h-5 block" :style="{ 'background-color': color.hexValue }"></span>
        <span class="ml-4">{{ color.name }}</span>
      </div>
      <check-icon v-if="isColorSelected(color)" :size="16" />
    </li>
  </ul>
</template>

<script>
import { FALLBACK_TAG_COLOR } from '@/constants';
import CheckIcon from 'vue-material-design-icons/Check';

export default {
  components: {
    CheckIcon
  },
  props: {
    tag: {
      type: Object,
      required: true
    },
    colors: {
      type: Array,
      required: true
    }
  },
  methods: {
    isColorSelected(color) {
      if (this.tag.color) return this.tag.color == color.hexValue;

      return FALLBACK_TAG_COLOR == color.hexValue;
    },
    onColorPicked(tag, selectedColor) {
      this.$emit('pick', { tag, selectedColor });
    }
  }
};
</script>

<style scoped>
ul {
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.dark ul {
  box-shadow: rgb(0 0 0 / 20%) 0px 7px 29px 0px;
}
</style>
