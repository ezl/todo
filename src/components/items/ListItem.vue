<template>
  <div class="flex items-start">
    <div>
      <Checkbox v-model="item.completed" @click="update"/>
    </div>
    <div class="ml-3 w-full text-gray-300">
      <span :class="{ 'line-through': item.completed }">{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import { mapActions } from 'vuex';

export default {
  components: {
    Checkbox
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
    }
  },
  props: {
    item: {
      required: true,
      type: Object
    }
  },
  data() {
    return {};
  }
};
</script>
