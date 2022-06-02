<template>
  <ul class="bg-lotion dark:bg-dark-gunmetal z-20 p-3 text-xs dropdown w-48">
    <li class="mb-1 text-gray-400">Colors</li>
    <li
      @click="onColorPicked(tag.id, color.hexValue)"
      v-for="(color, index) in colors"
      :key="index"
      class="flex items-center justify-between mt-3 cursor-pointer">
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
    },
  },
  methods: {
    isColorSelected(color){
      if(this.tag.color) return this.tag.color == color.hexValue

      return FALLBACK_TAG_COLOR == color.hexValue
    },
    onColorPicked(tagId, selectedColor){
      this.$emit('pick', { tagId, selectedColor } )
    }
  }
}
</script>