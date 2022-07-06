<template>
  <span @click="onDiscard" class="text-secondary cursor-pointer hover:text-primary">
    <delete-outline-icon />
  </span>
</template>

<script>
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline';

export default {
  components: {
    DeleteOutlineIcon
  },
  props: {
    plural: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onDiscard() {
      this.$notify({
        group: 'prompt',
        title: 'Discard',
        text: `Do you really want to discard ${this.plural ? 'these tasks' : 'this task'}?`,
        data: {
          actions: [
            {
              label: 'Cancel',
              callback: close => {
                close();
              }
            },
            {
              label: 'Yes',
              callback: close => {
                this.$emit('discard');
                close();
              }
            }
          ]
        }
      });
    }
  }
};
</script>
