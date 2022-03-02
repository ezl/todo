<template>
  <div class="item-actions-wrapper flex-shrink-0 flex justify-between items-center">
    <SnoozeAction />
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

<style>
.item-actions-wrapper {
  width: 238px;
  padding-left: 86.6px;
  padding-right: 27px;
}
</style>
