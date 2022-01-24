<template>
  <textarea
    :value="value"
    @input="change"
    @keydown.enter="submit"
    ref="input"
    type="text"
    class="overflow-hidden bg-transparent w-full text-gray-200 focus:outline-none caret-yellow-300 px-2 placeholder:text-gray-500 resize-none"
    placeholder="Start typing to create a list item..."
    rows="1"
  ></textarea>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      initialInputHeight: null
    };
  },
  methods: {
    change(e) {
      this.$emit('input', e.target.value);
      this.resize();
    },
    submit(e) {
      e.preventDefault();
      this.$emit('submit');
      this.$refs.input.style.height = this.initialInputHeight;
    },
    focus() {
      this.$nextTick(() => this.$refs.input.focus());
    },
    resize() {
      this.$refs.input.style.height = 'auto';
      this.$refs.input.style.height = `${this.$refs.input.scrollHeight}px`;
    }
  },
  mounted() {
    this.initialInputHeight = window.getComputedStyle(this.$refs.input, null).getPropertyValue('height');
  }
};
</script>
