export default {
  props: {
    x: {
      required: true,
      type: Number
    },
    y: {
      required: true,
      type: Number
    },
    query: {
      required: true,
      type: String
    },
    options: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      offsetY: 30,
      selectedOptionIndex: 0
    };
  },
  computed: {
    style() {
      return {
        left: `${this.x}px`,
        top: `${this.y + this.offsetY}px`
      };
    }
  },
  methods: {
    getDynamicClassList(index) {
      if (index == this.selectedOptionIndex) {
        return ['bg-bright-gray', 'dark:bg-dark-charcoal'];
      }
      return ['hover:bg-bright-gray', 'dark:hover:bg-dark-charcoal'];
    },
    handleArrowKeysSelection(e) {
      let optionsCount = this.options.length;

      if (this.showCreationButton) optionsCount++;

      // Up
      if (e.keyCode == 38) {
        if (this.selectedOptionIndex == 0) this.selectedOptionIndex = optionsCount;
        if (this.selectedOptionIndex > 0) this.selectedOptionIndex--;
      }

      // Down
      if (e.keyCode == 40) {
        if (this.selectedOptionIndex < optionsCount - 1) {
          this.selectedOptionIndex++;
        } else {
          this.selectedOptionIndex = 0;
        }
      }

      // Enter
      if (e.key === 'Enter') {
        // pick current selection
        this.onSelect();
      }
    }
  },
  beforeMount() {
    window.addEventListener('keydown', this.handleArrowKeysSelection);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleArrowKeysSelection);
  },
  watch: {
    options: {
      handler: function(newVal) {
        // Reset selection index whenever suggestions change
        this.selectedOptionIndex = 0;
      }
    }
  }
};
