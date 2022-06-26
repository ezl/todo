<template>
  <div class="w-full">
    <span
      contenteditable="true"
      :data-placeholder="placeholderText"
      @input="change"
      @keydown="onKeyDown"
      @keypress="onKeyPress"
      @click="onClick"
      ref="input"
      :class="inputClasses"
      class="block cursor-text whitespace-pre-wrap overflow-hidden bg-transparent w-full text-dark-jungle-green dark:text-white focus:outline-none caret-primary p-2 "
    ></span>
    <TagsSuggestionPopup
      ref="suggestionsPopup"
      :tags="tagSuggestions"
      v-if="suggestionsPopupCoordinates"
      :x="suggestionsPopupCoordinates.x"
      :y="suggestionsPopupCoordinates.y"
      :query="tagThatIsBeingTyped.body"
      @select="onTagSelected"
    />
  </div>
</template>

<script>
import TagsSuggestionPopup from '@/components/tags/TagsSuggestionPopup';
import Tag from '@/models/Tag';
import { findParent } from '@/helpers/dom.js';

export default {
  components: {
    TagsSuggestionPopup
  },
  props: {
    value: {
      type: String,
      required: true
    },
    inputClasses: {},
    placeholderText: {
      type: String
    }
  },
  data() {
    return {
      initialInputHeight: null,
      currentCaretOffset: 0,
      tagThatIsBeingTyped: {
        body: '',
        startIndex: null,
        endIndex: null
      },
      suggestionsPopupCoordinates: null,
      ignoredTagsStartIndexes: []
    };
  },
  methods: {
    change(e) {
      // We have to keep track of the caret's position to reset it back later,
      // bcause changing contenteditable resets caret position
      this.saveCurrentCaretPosition();
      this.hideTagAssignmentGuide();

      this.$emit('input', e.target.textContent);
      this.resize();

      this.$nextTick(() => {
        // Frequently reset and update the ignored tag indexes
        this.ignoredTagsStartIndexes = this.ignoredTagsStartIndexes.filter(index => {
          return index <= this.value.length - 1;
        });

        const isTypingATag = this.userIsTypingATag();
        const justStartedTypingIt = this.tagThatIsBeingTyped.body.length === 1;
        const shouldBeIgnored = this.ignoredTagsStartIndexes.some(index => index === this.tagThatIsBeingTyped.startIndex);

        if (isTypingATag && !shouldBeIgnored) {
          if (!this.suggestionsPopupCoordinates && justStartedTypingIt) {
            this.suggestionsPopupCoordinates = this.getCaretAbsolutePosition();
          }

          if (justStartedTypingIt) {
            this.showTagAssignmentGuide();
          }
        } else {
          this.suggestionsPopupCoordinates = null;
          this.hideTagAssignmentGuide();
        }
      });
    },
    submit(e) {
      e.preventDefault();
      // Ignore if user hits enter while tag suggestion box is shown
      if (this.suggestionsPopupCoordinates) return;

      this.$emit('submit');
      this.$refs.input.style.height = this.initialInputHeight;
      this.suggestionsPopupCoordinates = null;
      this.ignoredTagsStartIndexes = [];
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
      const selection = window.getSelection();

      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();

      preCaretRange.selectNodeContents(this.$refs.input);
      preCaretRange.setEnd(range.endContainer, range.endOffset);

      const position = preCaretRange.toString().length;

      return position;
    },
    discardPastedTextFormatting() {
      this.$refs.input.addEventListener('paste', e => {
        e.preventDefault();
        const str = e.clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, str);
      });
    },
    onTagSelected(tag) {
      this.focus();
      this.hideTagAssignmentGuide();
      this.autoCompleteTagRemainingCharacters(tag.name);
      this.suggestionsPopupCoordinates = null;

      this.$emit('tag-selected', {
        tag,
        startIndex: this.tagThatIsBeingTyped.startIndex,
        endIndex: this.tagThatIsBeingTyped.endIndex
      });
    },
    userIsTypingATag() {
      // retrieve current caret position
      const currentCaretOffset = this.getCurrentCaretPosition();
      // get all words that precede current caret position, and ignore words that come after that
      const words = this.value.substring(0, currentCaretOffset);
      // extract tags
      const matches = words.match(/(#[0-9a-zA-Z ]*)/g);
      // take the last one
      let tag;
      if (matches != null) {
        tag = matches[matches.length - 1];
      }

      const tagStartIndex = tag ? currentCaretOffset - tag.length : null;
      const tagEndIndex = tag ? currentCaretOffset : null;

      // check if it's a valid tag
      if (/^#[0-9a-zA-Z ]*?$/.test(tag)) {
        this.tagThatIsBeingTyped.body = tag;
        this.tagThatIsBeingTyped.startIndex = tagStartIndex;
        this.tagThatIsBeingTyped.endIndex = tagEndIndex;
        return true;
      }

      this.tagThatIsBeingTyped.body = '';
      this.tagThatIsBeingTyped.startIndex = null;
      this.tagThatIsBeingTyped.endIndex = null;

      return false;
    },
    autoCompleteTagRemainingCharacters(str) {
      const selection = window.getSelection();
      const remainingCharacters = str.slice(this.tagThatIsBeingTyped.body.length) + ' ';
      const textNode = document.createTextNode(remainingCharacters);
      const range = selection.getRangeAt(0);

      range.insertNode(textNode);

      range.collapse(false);

      // we need to merge all text nodes into a single node
      this.$refs.input.normalize();

      this.saveCurrentCaretPosition();
      this.updateInputValue(this.$refs.input.textContent);
      this.$emit('input', this.$refs.input.textContent);
      this.tagThatIsBeingTyped.endIndex += remainingCharacters.length;
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

      let p = findParent(this.$el, el => {
        if (window.getComputedStyle(el).getPropertyValue('position') == 'relative') {
          return true;
        }

        if (window.getComputedStyle(el).getPropertyValue('transform') != 'none') {
          return true;
        }
      });

      const pos = {
        x: rect.right,
        y: rect.top
      };

      // add offset only on bigger devices
      if (window.screen.width > 480) {
        pos.y = pos.y + (p ? p.scrollY : window.scrollY);
      }

      return pos;
    },
    showTagAssignmentGuide() {
      if (document.querySelector('#tag-assignment-guide')) return;
      // Don’t show if the caret is not at the end
      if (this.getCurrentCaretPosition() !== this.value.length) return;

      const label = 'type to add tag or press ESC to cancel';

      const span = document.createElement('span');
      span.innerText = `  ${label}`;
      span.id = 'tag-assignment-guide';
      span.className = 'dark:text-white text-black opacity-60';
      this.$refs.input.appendChild(span);
    },
    hideTagAssignmentGuide() {
      const span = document.querySelector('#tag-assignment-guide');

      if (span) {
        span.parentElement.removeChild(span);
        this.$emit('input', this.$refs.input.textContent);
      }
    },
    placeCaretAtTheEnd() {
      const range = document.createRange();
      const selection = window.getSelection();

      range.selectNodeContents(this.$refs.input);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    },
    updateInputValue(value) {
      this.$refs.input.textContent = value;
      // place the caret back at its previous position, after changing input value
      this.restoreCaretPosition();
    },
    onKeyDown(e) {
      // Ignore and disable up/down arrow keys
      if (e.keyCode == 38 || e.keyCode == 40) e.preventDefault();

      if (e.key === 'Enter') this.submit(e);

      if (e.key === 'Escape' || e.key === 'Esc') {
        this.ignoredTagsStartIndexes.push(this.tagThatIsBeingTyped.startIndex);

        this.suggestionsPopupCoordinates = null;
        this.tagThatIsBeingTyped.body = '';
        this.tagThatIsBeingTyped.startIndex = null;
        this.tagThatIsBeingTyped.endIndex = null;
        this.hideTagAssignmentGuide();
      }
    },
    onKeyPress(e){
      // Prevent the user from creating tags containing disallowed characters 
      if (this.suggestionsPopupCoordinates) {
        const typedChar = String.fromCharCode(e.keyCode);
        const allowedKeys = [38, 40, 13, 27];

        if (!/[0-9a-zA-Z ]/.test(typedChar) && !allowedKeys.includes(e.keyCode)) {
          this.$notify({ group: 'general', title: `Oops, are you trying to create a tag with a '${typedChar}' in it? Tags can only contain the following characters: A-Z, a-z, 0-9, space and "_".` });
          e.preventDefault()
        }
      }
    },
    onClick(e) {
      //Close tags suggestion popup when the user clicks somewhere on the input
      this.suggestionsPopupCoordinates = null;
      this.hideTagAssignmentGuide();
    }
  },
  computed: {
    tagSuggestions() {
      let tags = Tag.query()
        .with('items')
        .get();

      if (tags) {
        tags = tags
          .filter(tag => tag.name.toLowerCase().includes(this.tagThatIsBeingTyped.body.toLowerCase().trim()))
          // Sort by usage frequency
          .sort((a, b) => b.items.length - a.items.length)
          .slice(0, 8);
      }

      return tags;
    }
  },
  mounted() {
    this.initialInputHeight = window.getComputedStyle(this.$refs.input, null).getPropertyValue('height');
    this.$refs.input.textContent = this.value;
    this.discardPastedTextFormatting();
    this.$nextTick(() => this.placeCaretAtTheEnd());

    // close suggestions popup when user clicks somewhere else
    document.body.addEventListener('click', e => {
      if (this.$el === e.target) return;
      if (this.$el.contains(e.target)) return;

      this.suggestionsPopupCoordinates = null;
      this.hideTagAssignmentGuide();
    });
  },
  watch: {
    value: {
      handler: function(newValue, oldVale) {
        this.updateInputValue(newValue);
      }
    }
  }
};
</script>

<style scoped>
[contenteditable='true'] {
  border-radius: 10px;
}

[contenteditable='true']:focus {
  background: #f2f2f2;
}

.dark [contenteditable='true']:focus {
  background: #141317;
}

[contenteditable='true']:empty:before {
  content: attr(data-placeholder);
  @apply dark:text-white text-black opacity-60;
}
</style>
