<template>
  <span @click="$emit('click')" :class="{'!border-primary bg-primary !text-white': selected}" class="select-action w-5 h-5 rounded-full border-2 border-gray-400 cursor-pointer text-transparent hover:border-primary">
    <check-icon :size="16" class="flex justify-center items-center"/>
  </span>
</template>

<script>
import CheckIcon from 'vue-material-design-icons/Check';

export default {
  components: {
    CheckIcon
  },
  props: {
    selected: {
      type: Boolean,
      default: false
    }
  }
};
</script>