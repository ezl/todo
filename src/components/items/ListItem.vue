<template>
  <div class="flex justify-start items-center list-item-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <ItemActionsGroup :class="{ visible: showActions, invisible: !showActions }" />
    <div class="list-item-content flex items-center py-1 rounded.lg">
      <div>
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" :class="{'!border-primary': showActions}"/>
      </div>
      <div class="ml-6 w-full text-dark-jungle-green dark:text-gray-300 break-all">
        <ListItemBody :item="item" />
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import ItemActionsGroup from './actions/ItemActionsGroup';
import Item from '@/models/Item';
import Setting from '@/models/Setting';
import ListItemBody from '@/components/items/ListItemBody';

export default {
  components: {
    Checkbox,
    ItemActionsGroup,
    ListItemBody
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

      document.querySelector('.action-labels').style.visibility = 'visible';
    },
    onMouseLeave() {
      if (this.dragging === false) this.showActions = false;

      document.querySelector('.action-labels').style.visibility = 'hidden';
    }
  }
};
</script>

<style scoped>
.list-item-wrapper{
  transition: none;
}

.list-item-wrapper:hover{
  background: #F2F2F2;
}

.dark .list-item-wrapper:hover{
  background: #24222B;
}
</style>