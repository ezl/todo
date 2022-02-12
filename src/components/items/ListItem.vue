<template>
  <div class="flex justify-start items-center list-item-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <ItemActionsGroup :class="{ visible: showActions, invisible: !showActions }" />
    <div class="list-item-content hover:bg-lotion dark:hover:bg-dark-gunmetal flex items-start py-1 px-2  rounded.lg">
      <div>
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" />
      </div>
      <div class="ml-3 w-full text-dark-jungle-green dark:text-gray-300 break-all">
        <span :class="{ 'line-through': item.completed }">{{ item.body }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import ItemActionsGroup from './actions/ItemActionsGroup';
import Item from '@/models/Item';
import Setting from '@/models/Setting';

export default {
  components: {
    Checkbox,
    ItemActionsGroup
  },
  props: {
    item: {
      required: true,
      type: Object
    },
    dragging: {
      type: Boolean
    }
  },
  data() {
    return {
      showActions: false
    };
  },
  computed: {
    settings() {
      return Setting.query().first();
    }
  },
  methods: {
    onCompletionStatusChanged() {
      // delete it straight away after completion, if user prefers that
      if (this.item.completed && this.settings.completed_preference === 'clear_immediately') {
        this.item.$delete();
        return;
      }

      this.item.$save();
    },
    onMouseEnter() {
      if (this.dragging === false) this.showActions = true;
    },
    onMouseLeave() {
      if (this.dragging === false) this.showActions = false;
    }
  }
};
</script>
