<template>
  <input
    :value="value"
    @input="change"
    @keyup.enter="submit"
    ref="input"
    type="text"
    class="bg-transparent w-full text-gray-200 focus:outline-none caret-yellow-300 p-2 placeholder:text-gray-500"
    placeholder="Start typing to create a list item..."
  />
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
      checked: this.value
    };
  },
  methods: {
    change(e) {
      this.$emit('input', e.target.value);
    },
    submit() {
      this.$emit('submit');
    },
    focus() {
      this.$nextTick(() => this.$refs.input.focus());
    }
  }
};
</script>
