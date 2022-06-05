<template>
  <span class="handle cursor-move text-secondary hover:text-primary">
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