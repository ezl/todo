<template>
  <div class="flex items-center justify-center py-1 px-2">
    <div>
      <Checkbox v-model="completed" class="opacity-60" />
    </div>
    <div class="ml-4 w-full">
      <Input v-model="body" @submit="submit" @input="onChange" ref="input" />
    </div>
    <TagsSuggestionPopup
      ref="suggestionsPopup"
      :tags="tagSuggestions"
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
import Item from '@/models/Item';
import Tag from '@/models/Tag';

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
    async submit() {
      if (this.body.trim().length == 0) {
        return;
      }

      const item = await Item.add(this.body, this.completed);

      // Extract all tag names that the user typed into the input
      const includedTagNames = this.extractInsertedTags();
      // Retrieve corresponding tags, and create the ones that don't exist
      const tags = await this.findOrCreateTags(includedTagNames);
      // Attach these tags to the item we just created
      if (tags.length) {
        Item.insertOrUpdate({
          data: {
            id: item.id,
            tags
          }
        });
      }

      this.body = '';
      this.completed = false;
      this.suggestionsPopupCoordinates = null;
    },
    onTagSelected(tag) {
      this.$refs.input.focus();
      this.hideTagAssignmentGuide();
      this.autoCompleteTagRemainingCharacters(tag.name);
      this.suggestionsPopupCoordinates = null;
    },
    onChange() {
      if (this.userIsTypingATag()) {
        if (!this.suggestionsPopupCoordinates) {
          this.suggestionsPopupCoordinates = this.getCaretAbsolutePosition();
        }

        if (this.tagThatIsBeingTyped.length === 1) {
          this.$nextTick(this.showTagAssignmentGuide);
        } else {
          this.$nextTick(this.hideTagAssignmentGuide);
        }
      } else {
        this.suggestionsPopupCoordinates = null;
        this.$nextTick(this.hideTagAssignmentGuide);
      }
    },
    userIsTypingATag() {
      // retrieve current caret position
      const currentCaretOffset = this.$refs.input.getCurrentCaretPosition();
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
    },
    extractInsertedTags() {
      const tags = [];
      const matches = this.body.match(/#\w+/g);

      if (!matches) return tags;

      for (let index = 0; index < matches.length; index++) {
        tags.push(matches[index]);
      }

      return tags;
    },
    async findOrCreateTags(names) {
      const tags = [];

      for (let index = 0; index < names.length; index++) {
        const name = names[index];

        let tag = Tag.query()
          .where('name', names[index])
          .first();

        if (!tag) {
          tag = await Tag.add(name);
        }

        tags.push(tag);
      }

      return tags;
    },
    showTagAssignmentGuide() {
      if (document.querySelector('#tag-assignment-guide')) return;
      // Don’t show if the caret is not at the end
      if (this.$refs.input.getCurrentCaretPosition() !== this.body.length) return;

      const label = this.tagSuggestions.length === 0 ? 'type to create a new tag...' : 'type to add a tag...'

      const span = document.createElement('span');
      span.innerText = `  ${label}`;
      span.id = 'tag-assignment-guide';
      span.className = 'dark:text-white text-black opacity-60';
      this.$refs.input.$el.appendChild(span);
    },
    hideTagAssignmentGuide() {
      const span = document.querySelector('#tag-assignment-guide');

      if (span) {
        span.parentElement.removeChild(span);
      }
    }
  },
  computed: {
    tagSuggestions() {
      let tags = Tag.all();

      if (tags) {
        tags = tags.filter(tag => tag.name.toLowerCase().includes(this.tagThatIsBeingTyped.toLowerCase())).slice(0, 8);
      }

      return tags;
    }
  },
  mounted() {
    // close suggestions popup when user clicks somewhere else
    document.body.addEventListener('click', e => {
      if (this.$refs.input === e.target) return;

      this.suggestionsPopupCoordinates = null;
      this.hideTagAssignmentGuide();
    });
  }
};
</script>
