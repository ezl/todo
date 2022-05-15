<template>
  <div class="menu hidden">
    <div @click="$emit('go-back')" class="flex items-center cursor-pointer">
      <ChevronLeftIcon class="w-10 h-10 text-primary" />
      <h4 class="">Hotkeys settings</h4>
    </div>
    <div class="h-full flex justify-center items-center">
      <h1>WIP</h1>
    </div>
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
