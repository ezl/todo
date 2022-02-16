<template>
  <span class="handle cursor-move text-gray-400 dark:hover:text-yellow p-2 hover:bg-slate-200 dark:hover:bg-inherit">
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