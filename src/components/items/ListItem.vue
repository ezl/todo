<template>
  <div class="flex justify-start list-item-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <ItemActionsGroup :class="{ visible: showActions, invisible: !showActions }" />
    <div class="list-item-content flex items-start py-1 px-2  rounded.lg">
      <div>
        <Checkbox v-model="item.completed" @click="update" />
      </div>
      <div class="ml-3 w-full text-gray-300 break-all">
        <span :class="{ 'line-through': item.completed }">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import { mapActions } from 'vuex';
import ItemActionsGroup from './actions/ItemActionsGroup';

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
  methods: {
    ...mapActions({
      updateItem: 'items/updateItem'
    }),
    update() {
      try {
        this.updateItem({
          id: this.item.id,
          updatedProperties: {
            completed: this.item.completed
          }
        });
      } catch (error) {
        console.error('Failed to update item. Error: ', error);
      }
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

<style>
.list-item-content:hover {
  background: #24222b;
}
</style>
