<template>
  <div class="item-actions-wrapper flex-shrink-0 flex justify-between items-start px-10 relative">
    <DragAction />
    <SelectAction />
    <RunPomodoroAction />
    <SnoozeAction />

    <div class="action-labels flex justify-between absolute">
      <span class="text-xs text-gray-400">drag</span>
      <span class="text-xs text-gray-400">select</span>
      <span class="text-xs text-gray-400">pomo</span>
      <span class="text-xs text-gray-400">snooze</span>
    </div>
  </div>
</template>

<script>
import DragAction from './DragAction';
import SelectAction from './SelectAction';
import RunPomodoroAction from './RunPomodoroAction';
import SnoozeAction from './SnoozeAction';

export default {
  components: {
    DragAction,
    SelectAction,
    RunPomodoroAction,
    SnoozeAction
  }
};
</script>

<style>
.item-actions-wrapper{
    width: 288px;
}

.action-labels {
  top: -106px;
  width: 224px;
  left: 34px;
}
</style>
