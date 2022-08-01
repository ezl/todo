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
    },
    usable: {
      type: Boolean,
      default: true
    },
  },
  methods: {
    onDiscard() {
      if(!this.usable) return

      this.$emit('begin-action', 'discard')

      this.$notify({
        group: 'prompt',
        title: 'Discard',
        text: `Do you really want to discard ${this.plural ? 'these tasks' : 'this task'}?`,
        data: {
          actions: [
            {
              type: 'cancel',
              label: 'Cancel',
              callback: close => {
                close();
                this.$emit('end-action')
              }
            },
            {
              type: 'confirm',
              label: 'Yes',
              callback: close => {
                this.$emit('discard');
                this.$emit('end-action')
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
