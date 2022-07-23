<template>
  <div
    class="flex justify-start items-start list-item-wrapper mt-2 md:m-0 px-2 md:p-0 relatives "
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
    @keydown="onKeyDown"
    @touchstart="$emit('touchstart', $event)"
    @touchmove="$emit('touchmove', $event)"
    @touchend="$emit('touchend', $event)"
  >
    <!-- Actions -->
    <div
      ref="actions"
      :class="listItemActionsDynamicClasses"
      class="flex-shrink-0 flex justify-between items-center list-item-actions pt-1 w-2/12 flex md:ml-2"
    >
      <DiscardAction @discard="onDiscard" :plural="selected" :usable="canUseAction('discard')" @begin-action="onActionStart" @end-action="onActionEnd" class="hidden md:inline" />
      <SnoozeAction @snooze="onSnooze" :plural="selected" :usable="canUseAction('snooze')" @begin-action="onActionStart" @end-action="onActionEnd" class="hidden md:inline" />
      <SelectAction :selected="selected" @click="onToggleSelection" :usable="canUseAction('select')" @begin-action="onActionStart" @end-action="onActionEnd" class="select-action" />
      <DragAction />
    </div>

    <div :class="{ 'w-full': !editing }" class="md:ml-8 flex items-start py-1">
      <div class="checkbox-wrapper">
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" />
      </div>
      <div
        :class="{ editing: editing && !item.completed }"
        class="list-item-body-wrapper ml-3 w-full text-dark-jungle-green dark:text-white px-3 py-2 rounded-lg flex"
      >
        <div>
          <div v-show="!editing && !item.completed" @click="startEditing">
            <ListItemBody :item="item" :class="{ 'line-through': item.completed }" class="body" />
          </div>
          <NewTaskInput v-if="editing && !item.completed" v-model="body" @submit="submit" ref="input" @tag-selected="onTagSelected" inputClasses="p-0" />
          <p v-show="item.completed" ref="animatedBody" :class="{ strikethrough: item.completed }" class="">{{ body }}</p>
        </div>
        <span class="label visible md:invisible ml-5 text-secondary">{{ creationDate }}</span>
        <span class="label visible md:invisible ml-5 text-secondary">{{ assignedUsersLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Item from '@/models/Item';
import Setting from '@/models/Setting';
import ListItemBody from '@/components/items/ListItemBody';
import NewTaskInput from '@/components/items/input/NewTaskInput';
import DragAction from '@/components/items/actions/DragAction';
import SelectAction from '@/components/items/actions/SelectAction';
import SnoozeAction from '@/components/items/actions/SnoozeAction';
import DiscardAction from '@/components/items/actions/DiscardAction';
import ChangeLogger from '../../sync/ChangeLogger';
import moment from 'moment';
import auth from '@/helpers/auth';

export default {
  components: {
    Checkbox,
    ListItemBody,
    NewTaskInput,
    DragAction,
    SelectAction,
    SnoozeAction,
    DiscardAction
  },
  props: {
    item: {
      required: true,
      type: Object
    },
    dragging: {
      type: Boolean
    },
    showActions: {
      type: Boolean
    },
    selected: {
      type: Boolean,
      default: false
    },
    interactable: {
      type: Boolean,
      default: true
    },
    inMultiSelectionMode: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      editing: false,
      body: this.item.body,
      isMobile: screen.width <= 768,
      selectedTags: [],
      pendingAction: false,
      pendingActionName: null,
    };
  },
  computed: {
    settings() {
      return Setting.query().first();
    },
    listItemActionsDynamicClasses() {
      const classList = [];

      this.showActions ? classList.push('visible') : classList.push('invisible');

      return classList;
    },
    creationDate() {
      return moment
        .utc(this.item.created_at)
        .local()
        .format('M/DD');
    },
    isAssignedToCurrentUser(){
      return this.item.item_user_pivot.some(pivot => {
        if(!auth().isLoggedIn()) return false
        return pivot.user_id == auth().user().id && pivot.is_assigned && !pivot.is_owner
      })
    },
    assignedUsersLabel(){
      const assignedUsers = []
      this.item.users.forEach(user => {
        if(!auth().isLoggedIn()) return

        const assigned = this.item.item_user_pivot.some(pivot => {
          return pivot.user_id == user.id && pivot.is_assigned && !pivot.is_owner
        })
        if(assigned) assignedUsers.push(user.email)
      })

      if(! assignedUsers.length) return
      
      let label = 'assigned to: '

      if(this.isAssignedToCurrentUser){
        if(assignedUsers.length > 1){
          label += `you & ${assignedUsers.length - 1} others`
        }else{
          label += 'you'
        }
      }else{
        if(assignedUsers.length > 1){
          label += `${assignedUsers[0]} & ${assignedUsers.length - 1} others`
        }else{
          label += assignedUsers[0]
        }   
      }

      return label
    }
  },
  methods: {
    submit() {
      this.stopEditing();
    },
    async save() {
      if (this.item.body === this.body) return;

      this.item.body = this.body;
      await this.item.$save();
      await this.item.detachRemovedTags();
      await this.item.assignSelectedTags(this.selectedTags);
      this.item.updateTagPositionsInBody();
      this.selectedTags = [];
      ChangeLogger.itemPropertyValueChanged(this.item.id, 'body', this.body);
    },
    onCompletionStatusChanged() {
      this.item.$save();

      if (this.item.completed) {
        this.$nextTick(this.strikeThroughBodyText);
      }

      this.$emit('completion-status-changed', this.item);

      ChangeLogger.itemPropertyValueChanged(this.item.id, 'completed_at', this.item.completed_at);
    },
    onDiscard() {
      this.$emit('discard')

      // Delegate discarding of this item to parent component if we are in multi-selection mode
      if(this.selected){
        return
      }

      this.item.discard()
    
      this.$notify({
        group: 'basic',
        title: 'Discarded',
        text: 'Item successfully removed!'
      });
    },
    startEditing() {
      if(!this.interactable) return

      this.editing = true;
      this.$emit('started-editing', this.item.id);
    },
    async stopEditing() {
      if (this.body.trim().length === 0) {
        await ChangeLogger.entityDeleted('item', this.item.id);
        await this.item.$delete();
        this.$notify({
          group: 'basic',
          title: 'Deleted',
          text: 'Item successfully deleted!'
        });
      } else {
        this.save();
      }

      this.editing = false;
      this.$emit('finished-editing');
    },
    onKeyDown(e) {
      if (e.key === 'Escape' || e.key === 'Esc') this.stopEditing();
    },
    strikeThroughBodyText() {
      // We need each row/line of the list item body text to be in a separate container In order to animate them
      this.wrapWordsInElements();
      this.groupWordsByYPosition();

      const nodes = this.$refs.animatedBody.querySelectorAll('.row');

      Array.from(nodes).forEach(node => {
        let w = node.getBoundingClientRect().width;

        const offset = w - 0.2 * w;
        node.style.backgroundSize = ` ${w + offset}px 3px`;
        node.style.backgroundPosition = ` -${w + offset}px 50% `;

        setTimeout(() => {
          node.classList.add('strikethrough');
          node.classList.add('animation');
        }, 370);

        // animation completed
        setTimeout(() => {
          node.classList.remove('animation');
          // delete it straight away after completion, if user prefers that
          if (this.item.completed && this.settings.completed_preference === 'clear_immediately') {
            this.item.$delete();
          }
        }, 1000);
      });
    },
    wrapWordsInElements() {
      let el = this.$refs.animatedBody;
      const words = el.textContent.split(' ').filter(w => w.trim().length > 0);
      el.innerText = '';

      let lastYOffset;
      for (let i = 0; i < words.length; i++) {
        const node = document.createElement('span');

        node.innerText = words[i];
        node.className = 'word';
        el.appendChild(node);

        const offset = node.offsetTop + node.getBoundingClientRect().height;
        node.setAttribute('data-y-offset', offset);

        if (i < words.length - 1) {
          node.innerText += ' ';
        }
      }
    },
    groupWordsByYPosition() {
      const el = this.$refs.animatedBody;
      const wordNodes = el.querySelectorAll('.word');
      el.innerText = '';

      let lastYOffset;
      let currentParent;

      for (let index = 0; index < wordNodes.length; index++) {
        const node = wordNodes[index];
        const offset = parseFloat(node.getAttribute('data-y-offset'));

        if (!currentParent) {
          currentParent = document.createElement('p');
          currentParent.className = 'row';
          el.appendChild(currentParent);

          currentParent.appendChild(node);
        }

        if (lastYOffset && offset == lastYOffset) {
          currentParent.appendChild(node);
        } else {
          currentParent = document.createElement('p');
          currentParent.className = 'row';
          el.appendChild(currentParent);

          currentParent.appendChild(node);
        }

        lastYOffset = offset;
      }
    },
    onTagSelected(tagInfo) {
      this.selectedTags.push(tagInfo);
    },
    onToggleSelection() {
      this.$emit('selection-changed', {
        selected: !this.selected,
        item: this.item
      });
    },
    onSnooze(periodInDays){
      // If this component is part of a multi-selection, delegate snoozing to parent component (Tasks)
      if(this.selected){
        this.$emit('snooze', periodInDays);
        return
      }

      this.$el.classList.add('fade-out')

      setTimeout(() => {
        this.item.snooze(periodInDays);

        this.$notify({
          group: 'basic',
          title: 'Snoozed',
          text: 'Task successfully snoozed!'
        });
      }, 350);
    },
    onActionStart(actionName){
      this.pendingAction = true
      this.pendingActionName = actionName
      this.$emit('begin-action')
    },
    onActionEnd(){
      this.pendingAction = false
      this.pendingActionName = null

      if(this.inMultiSelectionMode) this.pendingActionName = 'select'

      this.$emit('end-action')
    },
    canUseAction(action){
      if(action == 'select'){
        return !this.pendingAction && this.interactable || this.inMultiSelectionMode
      }

      return !this.pendingAction && this.interactable || this.pendingActionName == 'select'
    },
  },
  async mounted() {
    if (this.item.completed) {
      this.strikeThroughBodyText();
    }

    if (this.item.tag_positions === null) {
      this.item.updateTagPositionsInBody();
    }

    // Disable context menu for this item
    this.$el.oncontextmenu = e => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
  },
  watch: {
    item: {
      handler: function(newVal, oldVal) {
        // Changes made from outside of this component

        // Ignore if suggestions box is visible
        if (!document.querySelector('#suggestion-popup')) this.body = newVal.body;

        if (newVal.completed_at != oldVal.completed_at) {
          this.onCompletionStatusChanged();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.list-item-wrapper {
  transition: opacity .5s ease-in ;
  opacity: 100%;
}

.list-item-wrapper.fade-out {
  opacity: 0;
}

.list-item-wrapper:hover {
  background: #f2f2f2;
}

.dark .list-item-wrapper:hover {
  background: #24222b;
}

.list-item-body-wrapper.editing {
  background: #f2f2f2;
}

.dark .list-item-body-wrapper.editing {
  background: #141317;
}

.checkbox-wrapper {
  margin-top: 12px;
}

.list-item-actions {
  margin-top: 9px;
  width: 172px;
  display: flex;
  justify-content: space-around;
}
.items-selection-mode .select-action {
  visibility: visible;
}

.list-item-wrapper:hover .label {
  visibility: visible;
}

.body,
.label {
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.list-item-wrapper >>> [contenteditable='true'] {
  min-width: 78px;
}

@media only screen and (max-width: 768px) {
  .list-item-actions {
    position: absolute;
    width: 52px;
    padding: 5px 0px;
    transform: translateX(calc(-68px));
  }
}
</style>
