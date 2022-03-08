<template>
  <div class="flex-shrink-0 flex justify-between items-center">
    <SnoozeAction  class="hidden md:inline"/>
    <SelectAction />
    <DragAction />
  </div>
</template>

<script>
import DragAction from './DragAction';
import SelectAction from './SelectAction';
import SnoozeAction from './SnoozeAction';

export default {
  components: {
    DragAction,
    SelectAction,
    SnoozeAction
  }
};
</script>
