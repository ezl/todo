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
      :options="tagSuggestions"
      v-if="suggestionsPopupCoordinates && autocomplete.type == 'tag'"
      :x="suggestionsPopupCoordinates.x"
      :y="suggestionsPopupCoordinates.y"
      :query="autocomplete.body"
      @select="onTagSelected"
    />
    <UserSuggestionPopup
      ref="suggestionsPopup"
      :options="userSuggestions"
      v-if="suggestionsPopupCoordinates && autocomplete.type == 'mention'"
      :x="suggestionsPopupCoordinates.x"
      :y="suggestionsPopupCoordinates.y"
      :query="autocomplete.body"
      @select="onUserSelected"
    />
  </div>
</template>

<script>
import TagsSuggestionPopup from '@/components/items/input/suggestions/TagsSuggestionPopup';
import UserSuggestionPopup from '@/components/items/input/suggestions/UserSuggestionPopup';
import Tag from '@/models/Tag';
import User from '@/models/User';
import { findParent } from '@/helpers/dom.js';
import auth from '@/helpers/auth';

export default {
  components: {
    TagsSuggestionPopup,
    UserSuggestionPopup
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
      autocomplete: {
        body: '',
        startIndex: null,
        endIndex: null,
        ignoredStartIndexes: [],
        type: null
      },
      suggestionsPopupCoordinates: null,
    };
  },
  methods: {
    change(e) {
      // We have to keep track of the caret's position to reset it back later,
      // bcause changing contenteditable resets caret position
      this.saveCurrentCaretPosition();
      this.hideAssignmentGuide();

      this.$emit('input', e.target.textContent);
      this.resize();

      this.$nextTick(this.handleAutoCompletion);
    },
    submit(e) {
      e.preventDefault();
      // Ignore if user hits enter while tag suggestion box is shown
      if (this.suggestionsPopupCoordinates) return;

      this.$emit('submit');
      this.$refs.input.style.height = this.initialInputHeight;
      this.suggestionsPopupCoordinates = null;
      this.autocomplete.ignoredStartIndexes = [];
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
    handleAutoCompletion() {
      // Frequently reset and update the ignored tag indexes
      this.autocomplete.ignoredStartIndexes = this.autocomplete.ignoredStartIndexes.filter(index => {
        return index <= this.value.length - 1;
      });

      const showSuggestions = this.shouldShowSuggestions();
      const justStartedTypingIt = this.autocomplete.body.length === 1;
      const shouldBeIgnored = this.autocomplete.ignoredStartIndexes.some(index => index === this.autocomplete.startIndex);

      if (showSuggestions && !shouldBeIgnored) {
        if (!this.suggestionsPopupCoordinates && justStartedTypingIt) {
          this.suggestionsPopupCoordinates = this.getCaretAbsolutePosition();
        }

        if (justStartedTypingIt) {
          let guideMsg = 'type to add tag or press ESC to cancel'
          if(this.autocomplete.type == 'mention') guideMsg = 'type an email to assign someone or press ESC to cancel'
          this.showAssignmentGuide(guideMsg);
        }
      } else {
        this.suggestionsPopupCoordinates = null;
        this.hideAssignmentGuide();
      }
    },
    onTagSelected(tag) {
      this.focus();
      this.hideAssignmentGuide();
      this.autoCompleteTagRemainingCharacters(tag.name);
      this.suggestionsPopupCoordinates = null;

      this.$emit('tag-selected', {
        tag,
        startIndex: this.autocomplete.startIndex,
        endIndex: this.autocomplete.endIndex
      });
    },
    onUserSelected(user) {
      console.log(user)
      this.focus();
      this.hideAssignmentGuide();
      //Could be just an email if the user doesn’t exist 
      this.autoCompleteTagRemainingCharacters(typeof user === 'string' ? user : user.email);
      this.suggestionsPopupCoordinates = null;

      this.$emit('assign-user', user);
    },
    shouldShowSuggestions() {
      // retrieve current caret position
      const currentCaretOffset = this.getCurrentCaretPosition();
      // get all words that precede current caret position, and ignore words that come after that
      const words = this.value.substring(0, currentCaretOffset);
      
      // extract tags
      let matches = words.match(/(#[0-9a-zA-Z ]*)$/g );
      // If what they are not currently typing is not a tag
      if(!matches){
        // Check if they are mentioning/assigning a user
        matches = words.match(/(@([0-9a-zA-Z@.])*)+/g)
        if(matches) this.autocomplete.type = 'mention'
      }else{
        // It's a tag
        this.autocomplete.type = 'tag'
      }

      // take the last match
      let match;
      if (matches != null) {
        match = matches[matches.length - 1];
      }

      const startIndex = match ? currentCaretOffset - match.length : null;
      const endIndex = match ? currentCaretOffset : null;
      let showSuggestions = false

      // check if it's a valid tag
      if (this.autocomplete.type == 'tag' && /^#[0-9a-zA-Z ]*?$/.test(match)) {
        showSuggestions = true;
      }
      // or if it's a valid mention
      if (this.autocomplete.type == 'mention' && /^@[^\s]*$/.test(match)) {
        showSuggestions = true;
      }

      if (showSuggestions) {
        this.autocomplete.body = match;
        this.autocomplete.startIndex = startIndex;
        this.autocomplete.endIndex = endIndex;
        
      } else {
        this.autocomplete.body = '';
        this.autocomplete.startIndex = null;
        this.autocomplete.endIndex = null;
      }

      return showSuggestions;
    },
    autoCompleteTagRemainingCharacters(fullString) {
      // In case what we’re auto completing is an email, the typed str will include a ‘@’ character at the beginning 
      // while the full str will not. So we should account for the character difference when determine remaining characters 
      let typedStrLength = this.autocomplete.body.length
      if(this.autocomplete.type === 'mention') typedStrLength--
      const remainingCharacters = fullString.slice(typedStrLength) + ' ';

      const selection = window.getSelection();
      const textNode = document.createTextNode(remainingCharacters);
      const range = selection.getRangeAt(0);

      range.insertNode(textNode);

      range.collapse(false);

      // we need to merge all text nodes into a single node
      this.$refs.input.normalize();

      this.saveCurrentCaretPosition();
      this.updateInputValue(this.$refs.input.textContent);
      this.$emit('input', this.$refs.input.textContent);
      this.autocomplete.endIndex += remainingCharacters.length;
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
    showAssignmentGuide(label) {
      if (document.querySelector('#assignment-guide')) return;
      // Don’t show if the caret is not at the end
      if (this.getCurrentCaretPosition() !== this.value.length) return;

      const span = document.createElement('span');
      span.innerText = `  ${label}`;
      span.id = 'assignment-guide';
      span.className = 'dark:text-white text-black opacity-60';
      this.$refs.input.appendChild(span);
    },
    hideAssignmentGuide() {
      const span = document.querySelector('#assignment-guide');

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
        // Blur the input if suggestions are not visible
        if(!this.suggestionsPopupCoordinates) this.$refs.input.blur()

        this.autocomplete.ignoredStartIndexes.push(this.autocomplete.startIndex);

        this.suggestionsPopupCoordinates = null;
        this.autocomplete.body = '';
        this.autocomplete.startIndex = null;
        this.autocomplete.endIndex = null;
        this.hideAssignmentGuide();
      }
    },
    onKeyPress(e) {
      // Prevent the user from creating tags containing disallowed characters
      this.validateTag(e);
    },
    // Checks if user is typing a valid tag
    validateTag(e) {
      if (this.suggestionsPopupCoordinates && this.autocomplete.type == 'tag') {
        const typedChar = String.fromCharCode(e.keyCode);
        const allowedKeys = [38, 40, 13, 27];

        if (!/[0-9a-zA-Z ]/.test(typedChar) && !allowedKeys.includes(e.keyCode)) {
          this.$notify({
            group: 'general',
            title: `Oops, are you trying to create a tag with a '${typedChar}' in it? Tags can only contain the following characters: A-Z, a-z, 0-9, space and "_".`
          });
          e.preventDefault();
        }
      }
    },
    onClick(e) {
      //Close tags suggestion popup when the user clicks somewhere on the input
      this.suggestionsPopupCoordinates = null;
      this.hideAssignmentGuide();
    },
    isFocused() {
      return document.activeElement === this.$refs.input
    }
  },
  computed: {
    tagSuggestions() {
      let tags = Tag.query()
        .with('items')
        .get();

      if (tags) {
        tags = tags
          .filter(tag => tag.name.toLowerCase().includes(this.autocomplete.body.toLowerCase().trim()))
          // Sort by usage frequency
          .sort((a, b) => b.items.length - a.items.length)
          .slice(0, 8);
      }

      return tags;
    },
    userSuggestions() {
      let users = User.query()
        .with('items')
        .get();

      if (users) {
        const email = this.autocomplete.body.slice(1) // exclude the leading '@'
        users = users
          .filter(user => {
            if(user.id === auth().user().id) return false

            return user.email.toLowerCase().startsWith(email.toLowerCase().trim())
          })
          .slice(0, 8);
      }

      return users;
    },
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
      this.hideAssignmentGuide();
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
