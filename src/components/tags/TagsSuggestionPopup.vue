<template>
  <ul id="tags-suggestion-popup" class=" shadow-md absolute bg-lotion dark:bg-dark-gunmetal rounded-md overflow-hidden" :style="style">
    <li
      v-for="(tag, index) in tags"
      :key="index"
      @click="onSelectTag(index)"
      :class="getDynamicClassList(index)"
      class="cursor-pointer px-4 py-1 flex items-center text-black dark:text-white tag-suggestion"
    >
      {{ tag.name }}
    </li>
    <li v-if="showCreationButton" class="tag-suggestion">
      <span
        @click="onSelectTag"
        :class="[...getDynamicClassList(tags.length), tags.length ? 'border-t border-secondary' : '']"
        class="px-4 py-1 cursor-pointer flex items-center text-primary text-sym"
      >
        <plus-circle-outline-icon :size="19" />
        <span class="block ml-1">create tag "{{ query }}"</span>
      </span>
    </li>
  </ul>
</template>

<script>
import Tag from '@/models/Tag';
import PlusCircleOutlineIcon from 'vue-material-design-icons/PlusCircleOutline';

export default {
  components: {
    PlusCircleOutlineIcon
  },
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
    tags: {
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
    },
    foundExactMatch() {
      return this.tags.some(tag => tag.name.toLowerCase() === this.query.toLowerCase())
    },
    showCreationButton() {
      if (!this.foundExactMatch && this.query != '#') return true;

      return false;
    }
  },
  methods: {
    async onSelectTag(index) {
      if (index === undefined) index = this.selectedOptionIndex;

      let tag = this.tags[index];

      if (!tag && this.query.length > 1) {
        tag = await Tag.add(this.query);
      }

      this.$emit('select', tag);
    },
    getDynamicClassList(index) {
      if (index == this.selectedOptionIndex) {
        return ['bg-bright-gray', 'dark:bg-dark-charcoal'];
      }
      return ['hover:bg-bright-gray', 'dark:hover:bg-dark-charcoal'];
    },
    handleArrowKeysSelection(e) {
      let optionsCount = this.tags.length;

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
        this.onSelectTag();
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
    tags: {
      handler: function(newVal) {
        // Reset selection index whenever suggestions change
        this.selectedOptionIndex = 0;
      }
    }
  }
};
</script>

<style>
#tags-suggestion-popup {
  width: 300px;
  z-index: 999;
}
</style>
