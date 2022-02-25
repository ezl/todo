<template>
  <div @click="toggle" :class="{'bg-primary checked': checked}" class="cursor-pointer checkbox flex items-center justify-center">
    <CheckIcon v-if="checked"/>
  </div>
</template>

<script>
import CheckIcon from '@/assets/images/icons/check.svg';

export default {
  components: {
    CheckIcon,
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      checked: this.value
    };
  },
  methods: {
    toggle() {
      this.checked = !this.checked;
      this.$emit('input', this.checked);
      this.$emit('click');
    }
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        this.checked = newValue;
      }
    }
  }
};
</script>

<style scoped>
.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #a4a4a7;
  border-radius: 2px;
}

.checkbox.checked{
    @apply border-primary;
    color: #fff;
}
</style>
