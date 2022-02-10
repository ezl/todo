<template>
  <div class="flex items-start py-1 px-2">
    <div>
      <Checkbox v-model="completed" />
    </div>
    <div class="ml-1 w-full">
      <Input v-model="body" @submit="submit" @input="onChange" ref="input" />
    </div>
    <TagsSuggestionPopup
      ref="suggestionsPopup"
      v-if="suggestionsPopupCoordinates"
      :x="suggestionsPopupCoordinates.x"
      :y="suggestionsPopupCoordinates.y"
      :query="tagThatIsBeingTyped"
      @select="onTagSelected"
    />
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Input from '@/components/inputs/Input';
import TagsSuggestionPopup from '@/components/tags/TagsSuggestionPopup';
import { mapActions } from 'vuex';

export default {
  components: {
    Checkbox,
    Input,
    TagsSuggestionPopup
  },
  data() {
    return {
      completed: false,
      body: '',
      tagThatIsBeingTyped: '',
      suggestionsPopupCoordinates: null
    };
  },
  methods: {
    ...mapActions({
      addItem: 'items/addItem'
    }),
    async submit() {
      if (this.body.trim().length == 0) {
        return;
      }

      try {
        await this.addItem({
          name: this.body,
          completed: this.completed
        });

        this.body = '';
        this.completed = false;
        this.suggestionsPopupCoordinates = null;
      } catch (error) {
        console.error(error);
      }
    },
    onTagSelected(tag) {
      this.$refs.input.focus();
      this.autoCompleteTagRemainingCharacters(tag.name);
      this.suggestionsPopupCoordinates = null;
    },
    onChange() {
      if (this.userIsTypingATag()) {
        if (!this.suggestionsPopupCoordinates) {
          this.suggestionsPopupCoordinates = this.getCaretAbsolutePosition();
        }
      } else {
        this.suggestionsPopupCoordinates = null;
      }
    },
    userIsTypingATag() {
      // retrieve current caret position
      const currentCaretOffset = this.$refs.input.getCurrentCaretPosition()
      // get all words that precede current caret position, and ignore words that come after that
      const words = this.body.substring(0, currentCaretOffset).split(' ');
      // the word that the user is currently typing
      const lastWord = words[words.length - 1];

      // check if it's a valid tag
      if (/^#(\w+)?$/.test(lastWord)) {
        this.tagThatIsBeingTyped = lastWord;
        return true;
      }

      this.tagThatIsBeingTyped = '';
      return false;
    },
    autoCompleteTagRemainingCharacters(str) {
      const selection = window.getSelection();
      const remainingCharacters = str.slice(this.tagThatIsBeingTyped.length) + ' ';
      const textNode = document.createTextNode(remainingCharacters);
      const range = selection.getRangeAt(0);

      range.insertNode(textNode);

      range.collapse(false);

      // we need to merge all text nodes into a single node
      this.$refs.input.$el.normalize();
      
      this.$refs.input.saveCurrentCaretPosition();
      this.body = this.$refs.input.$el.innerText;
    },
    getCaretAbsolutePosition() {
      const selection = document.getSelection();

      const range = selection.getRangeAt(0);

      const node = range.startContainer;
      const offset = range.startOffset;

      const newRange = document.createRange();
      newRange.setStart(node, offset - 1);
      newRange.setEnd(node, offset);

      const rect = newRange.getBoundingClientRect();

      return {
        x: rect.right,
        y: rect.top + window.scrollY
      };
    }
  },
  mounted() {
    // close suggestions popup when user clicks somewhere else
    document.body.addEventListener('click', e => {
      if (this.$refs.input === e.target) return;

      this.suggestionsPopupCoordinates = null;
    });
  }
};
</script>
