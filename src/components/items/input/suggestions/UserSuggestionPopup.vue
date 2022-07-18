<template>
  <ul id="suggestion-popup" class=" shadow-md absolute bg-lotion dark:bg-dark-gunmetal rounded-md overflow-hidden" :style="style">
    <li
      v-for="(user, index) in options"
      :key="index"
      @click="onSelect(index)"
      :class="getDynamicClassList(index)"
      class="cursor-pointer px-4 py-1 flex items-center text-black dark:text-white suggestion-box-option"
    >
      {{ user.email }}
    </li>
    <li v-if="showCreationButton" class="suggestion-box-option">
      <span
        @click="onSelect"
        :class="[...getDynamicClassList(options.length), options.length ? 'border-t border-secondary' : '']"
        class="px-4 py-1 cursor-pointer flex items-center text-primary text-sym"
      >
        <plus-circle-outline-icon :size="19" />
        <span class="block ml-1">Invite "{{ email }}"</span>
      </span>
    </li>
  </ul>
</template>

<script>
import User from '@/models/User';
import PlusCircleOutlineIcon from 'vue-material-design-icons/PlusCircleOutline';
import suggestionsPopup from '@/mixins/suggestionsPopup';
import { isEmailValid } from '@/helpers/general';

export default {
  components: {
    PlusCircleOutlineIcon
  },
  computed: {
    foundExactMatch() {
      return this.options.some(user => user.email.toLowerCase() === this.query.toLowerCase());
    },
    showCreationButton() {
      if (!this.foundExactMatch && this.isValidEmail) return true;

      return false;
    },
    email() {
      return this.query[0] == '@' ? this.query.slice(1) : this.query;
    },
    isValidEmail() {
      return isEmailValid(this.email);
    }
  },
  methods: {
    async onSelect(index) {
      if (index === undefined) index = this.selectedOptionIndex;

      let user = this.options[index];

      if (!user && this.query.length > 1) {
        if (!this.isValidEmail) {
          this.$notify({
            group: 'general',
            title: `Please enter a valid email address`
          });
          return;
        }

        // Set user to the email, if user doesn’t exist and it is a valid email 
        user = this.email
      }

      this.$emit('select', user);
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
</style>
