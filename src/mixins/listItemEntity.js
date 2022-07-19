export default {
  mounted() {
    // Add some margin if previous sibling was also an entity
    if (this.$el.previousSibling.nodeType === Node.ELEMENT_NODE) {
      this.$el.classList.add('!ml-1');
    }
  }
};
