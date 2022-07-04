<template>
  <span @click="$emit('click')" class="text-secondary cursor-pointer hover:text-primary">
    <delete-outline-icon />
  </span>
</template>

<script>
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline';

export default {
  components: {
    DeleteOutlineIcon
  }
};
</script>
