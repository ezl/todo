<template>
  <button @click="toggle" class="flex justify-center items-center rounded-full w-12 h-12 bg-primary fixed right-0 bottom-0 m-6 block md:hidden text-white">
    <pencil-icon />
  </button>
</template>

<script>
import PencilIcon from 'vue-material-design-icons/Pencil';

export default {
  components: {
    PencilIcon
  },
  props: ['value'],
  data() {
    return {
      toggled: this.value
    };
  },
  methods: {
    toggle() {
      this.toggled = !this.toggled;
      this.$emit('input', this.toggled);
    }
  },
  watch: {
    value: {
      handler: function(newVal) {
        this.toggled = newVal;
      }
    }
  }
};
</script>
