<template>
  <div @click="toggle" :class="{ 'checked ': checked }" class="relative cursor-pointer checkbox flex items-center justify-center border-2 border-secondary hover:border-primary">
    <lottie-animation v-if="checked" ref="anim" :animationData="animationData" :autoPlay="true" :loop="false" class="animation-wrapper" />
  </div>
</template>

<script>
const animationData = require('@/assets/lottie-animations/checkbox.json');
import LottieAnimation from 'lottie-web-vue';

export default {
  components: {
    LottieAnimation
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      checked: this.value,
      animationData
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
  border-radius: 2px;
  overflow: visible;
}
.checkbox .animation-wrapper {
  position: absolute;
  width: 40px;
  height: auto;
  pointer-events: none;
}

.checkbox.checked {
  @apply border-primary bg-primary;
  color: #fff;
}
</style>
