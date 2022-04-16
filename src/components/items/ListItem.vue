<template>
  <div
    class="flex justify-start items-start list-item-wrapper mt-2 md:m-0 px-2 md:p-0 relative "
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
      class="flex-shrink-0 flex justify-between items-center list-item-actions px-2 pt-1 w-2/12 lg:3/12 flex md:ml-2"
    >
      <SnoozeAction class="hidden md:inline" />
      <SelectAction :selected="selected" @click="onToggleSelection" class="select-action" />
      <DragAction />
    </div>

    <div :class="{ 'w-full': !editing }" class="md:ml-8 flex items-start py-1">
      <div class="checkbox-wrapper">
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" />
      </div>
      <div
        :class="{ editing: editing && !shouldBeDeleted && !item.completed, 'bg-blue-500': shouldBeDeleted }"
        class="list-item-body-wrapper ml-3 w-full text-dark-jungle-green dark:text-gray-300 px-3 py-2 rounded-lg"
      >
        <div v-show="!editing && !shouldBeDeleted && !item.completed" @click="startEditing">
          <ListItemBody :item="item" class="body" />
        </div>
        <Input
          v-if="editing && !shouldBeDeleted && !item.completed"
          v-model="body"
          @submit="submit"
          ref="input"
          @tag-selected="onTagSelected"
          inputClasses="p-0"
        />
        <p v-if="shouldBeDeleted" class="bg-blue-500 text-white w-full">{{ body }}</p>
        <p v-show="item.completed" ref="animatedBody" :class="{ strikethrough: item.completed }" class="">{{ body }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Item from '@/models/Item';
import Setting from '@/models/Setting';
import ListItemBody from '@/components/items/ListItemBody';
import Input from '@/components/inputs/Input';
import DragAction from '@/components/items/actions/DragAction';
import SelectAction from '@/components/items/actions/SelectAction';
import SnoozeAction from '@/components/items/actions/SnoozeAction';

export default {
  components: {
    Checkbox,
    ListItemBody,
    Input,
    DragAction,
    SelectAction,
    SnoozeAction
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
    }
  },
  data() {
    return {
      editing: false,
      body: this.item.body,
      shouldBeDeleted: false,
      isMobile: screen.width <= 768,
      selectedTags: []
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
    }
  },
  methods: {
    submit() {
      this.stopEditing();
    },
    async save() {
      this.item.body = this.body;
      await this.item.$save();
      await this.item.detachRemovedTags();
      await this.item.assignSelectedTags(this.selectedTags);
      this.item.updateTagPositionsInBody();
      this.selectedTags = [];
    },
    onCompletionStatusChanged() {
      this.item.$save();

      if (this.item.completed) {
        this.$nextTick(this.strikeThroughBodyText);
      }
    },

    startEditing() {
      this.editing = true;
      this.$emit('started-editing', this.item.id);
    },
    async stopEditing() {
      if (this.shouldBeDeleted || this.body.trim().length === 0) {
        await this.item.$delete();
      } else {
        this.save();
      }

      this.editing = false;
      this.$emit('finished-editing');
    },
    onKeyDown(e) {
      if (e.keyCode == 46) this.shouldBeDeleted = true;

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
    }
  },
  async mounted() {
    if (this.item.completed) {
      this.strikeThroughBodyText();
    }
    
    if (this.item.tags_meta === null) {
      this.item.updateTagPositionsInBody();
    }
  }
};
</script>

<style scoped>
.list-item-wrapper {
  transition: none;
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
}
.items-selection-mode .select-action {
  visibility: visible;
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
