<template>
  <div class="item-actions-wrapper flex-shrink-0 flex justify-between items-center">
    <SnoozeAction />
    <RunPomodoroAction />
    <SelectAction />
    <DragAction />
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
.item-actions-wrapper {
  width: 238px;
  padding-left: 25px;
  padding-right: 27px;
}
</style>
