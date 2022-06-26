<template>
  <div class="flex items-start">
    <div class="mt-3">
      <Checkbox v-model="item.completed" @click="onUncheckTask" />
    </div>
    <div class="ml-3 w-full text-dark-jungle-green dark:text-white px-3 py-2 rounded-lg">
      <ListItemBody :item="item" />
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import ListItemBody from '@/components/items/ListItemBody';
import ChangeLogger from '@/sync/ChangeLogger';
import moment from 'moment';

export default {
  components: {
    Checkbox,
    ListItemBody
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    onUncheckTask() {
      //Wait for the checkbox animation to finish
      setTimeout(async () => {
        await this.item.$save();
        ChangeLogger.itemPropertyValueChanged(this.item.id, 'completed_at', this.item.completed_at);
      }, 400);
    },
  }
};
</script>
