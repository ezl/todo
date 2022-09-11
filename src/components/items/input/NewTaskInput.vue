<template>
  <div class="w-full">
    <span
      contenteditable="true"
      :data-placeholder="placeholderText"
      @input="change"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
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
    item: {
      type: Object,
      required: false
    },
    inputClasses: {},
    placeholderText: {
      type: String
    }
  },
  data() {
    return {
      initialInputHeight: null,
      autocomplete: {
        body: '',
        startIndex: null,
        endIndex: null,
        type: null
      },
      suggestionsPopupCoordinates: null,
      caretPosition: {
        nodeIndex: null,
        endOffset: null
      }
    };
  },
  methods: {
    change(e) {
      // We have to keep track of the caret's position to reset it back later,
      // bcause changing contenteditable resets caret position
      this.saveCurrentCaretPosition();

      this.publishUpdate()
      this.resize();
    },
    // Notifies parent component about the new changes
    publishUpdate(){
      this.$emit('input', this.$refs.input.textContent);
    },
    submit(e) {
      e.preventDefault();
      // Ignore if user hits enter while tag suggestion box is shown
      if (this.suggestionsPopupCoordinates) return;

      this.$emit('submit');
      this.$refs.input.style.height = this.initialInputHeight;
      this.suggestionsPopupCoordinates = null;
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
      const range = selection.getRangeAt(0)
      let node

      // If nodeIndex is not null, this mean the caret was previously within an element and
      // the user was assigning a tag/someone
      if(this.caretPosition.nodeIndex != null){
        node = this.$refs.input.childNodes[this.caretPosition.nodeIndex]
      }else{
        if(this.$refs.input.childNodes.length > 1){
          node = this.$refs.input.childNodes[this.caretPosition.endOffset]
        }else{
          node = this.$refs.input.childNodes[0]
        }
      }

      if(!node) return

      // If it is an element, we will take its first child (which is expected to be a text node).
      if(node.nodeType === Node.ELEMENT_NODE){
      // Note: Entity elements will only contain a single child of type text node
        node = node.childNodes[0]
      }

      range.setStart(node, this.caretPosition.endOffset);

      selection.removeAllRanges();
      selection.addRange(range);
    },
    saveCurrentCaretPosition() {
      const selection = window.getSelection();

      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      // startContainer could be either an element or a text node.
      let node = range.startContainer

      preCaretRange.selectNodeContents(node);
      preCaretRange.setEnd(range.endContainer, range.endOffset);

      if(node.parentElement === this.$refs.input){
        this.caretPosition.nodeIndex = Array.from(this.$refs.input.childNodes).indexOf(node)
      }else{
        this.caretPosition.nodeIndex = Array.from(this.$refs.input.childNodes).indexOf(node.parentElement)
      }

      this.caretPosition.endOffset = range.endOffset
      this.caretPosition.node = node
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
      this.autoCompleteTagRemainingCharacters(tag.name)
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

      //Could be just an email if the user doesn’t exist 
      this.autoCompleteTagRemainingCharacters(typeof user === 'string' ? user : user.email);
      this.suggestionsPopupCoordinates = null;

      this.$emit('assign-user', user);
    },
    autoCompleteTagRemainingCharacters(str){
      const selection = document.getSelection();
      const range = selection.getRangeAt(0);
      const node = range.startContainer;

      if(node.nodeType === Node.ELEMENT_NODE) return

      if(!node.parentElement.hasAttribute('data-entity-type')) return

      node.nodeValue = str

      // Add some space by appending a new text node after the entity
      const whiteSpace = document.createTextNode(' ')
      node.parentElement.after(whiteSpace)

      this.updateCurrentEntityPosition()

      // Notify parent component about the change 
      this.publishUpdate()

      // Move the cursor to the end of the newly created text node
      range.setStart(whiteSpace, 1);

      // selection.removeAllRanges();
      // selection.addRange(range);
      this.saveCurrentCaretPosition()

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
    handleDisplayingAssignmentGuide() {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      let node = range.startContainer

      // startContainer could either be a text node or an element.
      // If it’s an element, get its 1st child (which should be a text node)
      if(node.nodeType === Node.ELEMENT_NODE) node = node.firstChild

      if(!node) return

      const id = 'assignment-guide'
      let el = document.querySelector(`#${id}`)  

      if(!node.parentElement.hasAttribute('data-entity-type')){
        if(el) el.parentElement.removeChild(el);
        this.publishUpdate()
        return
      }
 
      const entityType = node.parentElement.getAttribute('data-entity-type')

      if(entityType != 'tag' && entityType != 'mention') return

      if(node.nodeValue.length > 1 && el){
        el.parentElement.removeChild(el);
        this.publishUpdate()
      }

      let text = 'type to add tag or press ESC to cancel'

      if(entityType ==='mention') text = 'type an email to assign someone or press ESC to cancel'
      
      if(node.nodeValue.length === 1 && !el){
        el = document.createElement('span');
        el.textContent = `  ${text}`;
        el.id = id;
        el.className = 'dark:text-white text-black opacity-60';
        this.$refs.input.appendChild(el);
      }
    },
    placeCaretAtTheEnd(el) {
      const range = document.createRange();
      const selection = window.getSelection();

      range.selectNodeContents(el);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    },
    onKeyDown(e) {
      // Ignore and disable up/down arrow keys
      if (e.keyCode == 38 || e.keyCode == 40) e.preventDefault();

      if (e.key === 'Enter') this.submit(e);
    },
    onKeyUp(e) {
      this.saveCurrentCaretPosition()
      this.updateCurrentEntityPosition()
      this.handleDisplayingAssignmentGuide()
      this.HandleQuittingAssignmentMode(e)
      this.HandleSuggestionsDropdownVisibility()
    },
    // Track and update the position of the tag/username that’s being typed
    updateCurrentEntityPosition(){
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const node = range.startContainer

      if(node.nodeType === Node.TEXT_NODE && node.parentElement.hasAttribute('data-entity-type')){
        const nodes = this.$refs.input.childNodes
        let startIndex = 0
        let endIndex = 0
      
        for (let index = 0; index < nodes.length; index++) {
          const childNode = nodes[index];

          if(childNode === node.parentElement){
            endIndex = startIndex + childNode.textContent.length
            break
          }else{
            startIndex += childNode.textContent.length
          }
        }

        this.autocomplete.startIndex = startIndex
        this.autocomplete.endIndex = endIndex
      }else{
        this.autocomplete.startIndex = null
        this.autocomplete.endIndex = null
      }
    },
    onKeyPress(e) {
      // Prevent the user from creating tags containing disallowed characters
      this.validateTag(e);
      this.HandleEntityAssignment(e)
    },
    HandleEntityAssignment(e){
      const typedChar = String.fromCharCode(e.keyCode);
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const node = range.startContainer

      if(node.nodeType === Node.ELEMENT_NODE) return
      // Make sure we are not already in the middle of assigning tag/user
      if(node.parentElement.hasAttribute('data-entity-type')) return
 
      let entityType 
      
      // Are we about to start assigning a tag or a user?
      if(typedChar == '#') entityType = 'tag'
      if(typedChar == '@') entityType = 'mention'

      if(!entityType) return

    // Reaching mean we just started typing an entity (9tag/username)
      e.preventDefault();
      
      const entity = document.createElement('span')
      entity.className = 'text-primary'
      entity.setAttribute('data-entity-type', entityType)
      entity.innerHTML = typedChar
      
      // Figure out where we should place the entity within the contenteditable
      if (this.caretPosition.endOffset > 0 && this.caretPosition.endOffset < node.nodeValue.length) {
        // The caret is in the middle of this text node. 
        // We will split it (at the caret’s position) into two text node and place the span between them.
        const newTextNode = node.splitText(this.caretPosition.endOffset);
        this.$refs.input.insertBefore(entity, newTextNode)
      }else if (this.caretPosition.endOffset >= node.nodeValue.length) {
        // ater
        this.$refs.input.appendChild(entity)
      }else {
        // before
        this.$refs.input.insertBefore(entity, node)
      }
      
      // Place and move the caret to end of the element we just created
      this.placeCaretAtTheEnd(entity)

      // Start showing suggestions for corresponding entity
      this.HandleSuggestionsDropdownVisibility()
    },
    createEntityElement(type, content){
      const entity = document.createElement('span')
      entity.className = 'text-primary'
      entity.setAttribute('data-entity-type', type)
      entity.innerHTML = content

      return entity
    },
    HandleSuggestionsDropdownVisibility (){
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      let node = range.startContainer

      if(node.nodeType === Node.TEXT_NODE) node = node.parentElement

      if(!node.hasAttribute('data-entity-type')){
        this.suggestionsPopupCoordinates = null;
        this.autocomplete.body = '';
        this.autocomplete.startIndex = null;
        this.autocomplete.endIndex = null;
        return
      }

      // Reaching here means we are assigning either a user or tag.

      // Keep track of what the user is typing
      this.autocomplete.body = node.textContent

      // Initialize suggestions dropdown, if it is not already
      if (!this.suggestionsPopupCoordinates) {
        this.suggestionsPopupCoordinates = this.getCaretAbsolutePosition();
        this.autocomplete.type = node.getAttribute('data-entity-type')
      }
    },
    // Exits assignment mode and hides suggestions if the user hits ESC while assigning a tag/user
    HandleQuittingAssignmentMode(e){
      if (e.key != 'Escape' && e.key != 'Esc') return

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      let node = range.startContainer

      if(node.nodeType === Node.TEXT_NODE) node = node.parentElement

      if(!node.hasAttribute('data-entity-type')) return

      // We’ll replace the entire entity’s element with a text node, while keeping the content
      const newTextNode = document.createTextNode(node.textContent)

      node.parentElement.replaceChild(newTextNode, node)
      // Move the cursor to the end of the new node
      range.setStart(newTextNode, newTextNode.nodeValue.length);

      // Make sure to hide assignment guide, if it is visible 
      this.handleDisplayingAssignmentGuide()
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
      this.handleDisplayingAssignmentGuide()
    },
    isFocused() {
      return document.activeElement === this.$refs.input
    },
    // Loops through all entities (if any) within the passed in task’s body, and highlights them
    highlightExistingEntities (){
      // Item will only passed in edit mode
      if(! this.item) return

      const entities = this.item.extractAllEntitiesFromBody()
      const childNodes = []

      if(! entities.length) return
      
      let body = this.item.body
      for (let index = entities.length - 1; index >= 0; index--) {
        const entity = entities[index];
        
        const precedingCharacters = body.slice(0, entity.startIndex);
        const followingCharacters = body.slice(entity.endIndex);

        const followingTextNode = document.createTextNode(followingCharacters)
        childNodes.unshift(followingTextNode)

        const el = this.createEntityElement(entity.type, entity.body)
        childNodes.unshift(el)

        if (index == 0) {
          // Once we're done, create a text node for the remaining characters
          const precedingTextNode = document.createTextNode(precedingCharacters)

          childNodes.unshift(precedingTextNode)
        } else {
          body = precedingCharacters;
        }
      }

      this.$refs.input.innerHTML = ''

      childNodes.forEach(node => this.$refs.input.appendChild(node));
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
    this.$refs.input.innerHTML = this.value;
    this.discardPastedTextFormatting();
    this.$nextTick(() => this.placeCaretAtTheEnd(this.$refs.input));
    this.highlightExistingEntities()

    // close suggestions popup when user clicks somewhere else
    document.body.addEventListener('click', e => {
      if (this.$el === e.target) return;
      if (this.$el.contains(e.target)) return;

      this.suggestionsPopupCoordinates = null;
    });
  },
  watch: {
    value: {
      handler: function(newValue, oldVale) {
        // We’re sending the value as plain string without HTML to parent component
        // Override contenteditable’s content only if value did really change
        if(newValue != this.$refs.input.textContent){
          this.$refs.input.textContent = newValue;
          // place the caret back at its previous position, after changing input value
          this.restoreCaretPosition();
        }
      }
    },
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
