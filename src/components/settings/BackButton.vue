<template>
  <div @click="$emit('click', $event)" class="flex items-center cursor-pointer">
    <ChevronLeftIcon class="text-primary" />
    <h4 class="ml-2">
      <slot></slot>
    </h4>
  </div>
</template>

<script>
import ChevronLeftIcon from '@/assets/images/icons/chevron-left.svg';

export default {
    components: {
        ChevronLeftIcon
    }
};
</script>
