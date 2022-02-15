<template>
  <span
    contenteditable="true"
    data-placeholder="Start typing to create a list item..."
    @input="change"
    @keydown.enter="submit"
    ref="input"
    class="block cursor-text whitespace-pre-wrap overflow-hidden bg-transparent w-full text-dark-jungle-green dark:text-gray-200 focus:outline-none caret-black dark:caret-yellow px-2 "
  ></span>
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
      initialInputHeight: null,
      currentCaretOffset: 0
    };
  },
  methods: {
    change(e) {
      // We have to keep track of the caret's position to reset it back later,
      // bcause changing contenteditable resets caret position
      this.saveCurrentCaretPosition();

      this.$emit('input', e.target.innerHTML);
      this.resize();
    },
    submit(e) {
      e.preventDefault();
      this.$emit('submit');
      this.$refs.input.style.height = this.initialInputHeight;
    },
    focus() {
      this.$refs.input.focus();
      this.restoreCaretPosition();
    },
    resize() {
      this.$refs.input.style.height = 'auto';
      this.$refs.input.style.height = `${this.$refs.input.scrollHeight}px`;
    },
    restoreCaretPosition() {
      this.$refs.input.focus();

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      let node;
      if (this.$refs.input.childNodes.length) {
        node = this.$refs.input.childNodes[0];
      } else {
        return;
      }

      range.setStart(node, this.currentCaretOffset);

      selection.removeAllRanges();
      selection.addRange(range);
    },
    saveCurrentCaretPosition() {
      this.currentCaretOffset = this.getCurrentCaretPosition();
    },
    getCurrentCaretPosition() {
      const range = window.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();

      preCaretRange.selectNodeContents(this.$refs.input);
      preCaretRange.setEnd(range.endContainer, range.endOffset);

      const position = preCaretRange.toString().length;

      return position;
    },
  },
  mounted() {
    this.initialInputHeight = window.getComputedStyle(this.$refs.input, null).getPropertyValue('height');
    this.$refs.input.innerHTML = this.value;
  },
  watch: {
    value: {
      handler: function(newValue, oldVale) {
        this.$refs.input.innerHTML = newValue;
        // place the caret back at its previous position, after changing input value
        this.restoreCaretPosition();
      }
    }
  }
};
</script>

<style>
[contenteditable='true']:empty:before {
  content: attr(data-placeholder);
  @apply dark:text-white text-black opacity-60;
}
</style>
