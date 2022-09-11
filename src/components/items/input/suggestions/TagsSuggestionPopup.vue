<template>
  <ul id="suggestion-popup" class=" shadow-md absolute bg-lotion dark:bg-dark-gunmetal rounded-md overflow-hidden" :style="style">
    <li
      v-for="(tag, index) in options"
      :key="index"
      @click="onSelect(index)"
      :class="getDynamicClassList(index)"
      class="cursor-pointer px-4 py-1 flex items-center text-black dark:text-white suggestion-box-option"
    >
      {{ tag.name }}
    </li>
    <li v-if="showCreationButton" class="suggestion-box-option create">
      <span
        @click="onSelect"
        :class="[...getDynamicClassList(options.length), options.length ? 'border-t border-secondary' : '']"
        class="px-4 py-1 cursor-pointer flex items-center "
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
import suggestionsPopup from '@/mixins/suggestionsPopup';

export default {
  components: {
    PlusCircleOutlineIcon
  },
  computed: {
    foundExactMatch() {
      return this.options.some(tag => tag.name.toLowerCase() === this.query.toLowerCase());
    },
    showCreationButton() {
      if (!this.foundExactMatch && this.query != '#') return true;

      return false;
    }
  },
  methods: {
    async onSelect(index) {
      if (index === undefined) index = this.selectedOptionIndex;

      let tag = this.options[index];

      if (!tag && this.query.length > 1) {
        tag = await Tag.add(this.query);
      }

      this.$emit('select', tag);
    }
  },
  mixins: [suggestionsPopup]
};
</script>

<style>
#suggestion-popup {
  width: 300px;
  z-index: 999;
}

.suggestion-box-option.create {
  color:#00F3C8;
}
</style>
