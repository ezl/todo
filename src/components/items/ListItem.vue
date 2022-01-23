<template>
  <div class="flex items-start">
    <div>
      <Checkbox v-model="item.completed"  />
    </div>
    <div class="ml-3 w-full text-gray-200">
      <span :class="{'line-through': item.completed}">{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';

export default {
  components: {
    Checkbox
  },
  props: {
      item: {
          required: true,
          type: Object
      }
  },
  data() {
    return {

    };
  },
 
};
</script>
