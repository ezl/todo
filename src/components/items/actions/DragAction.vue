<template>
  <span class="handle cursor-move text-gray-400 hover:text-primary">
    <DragIcon />
  </span>
</template>

<script>
import DragIcon from '@/assets/images/icons/drag.svg';

export default {
  components: {
    DragIcon
  }
}
</script>