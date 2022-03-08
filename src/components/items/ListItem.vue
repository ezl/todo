<template>
  <div
    class="flex justify-start items-start list-item-wrapper mt-2 md:m-0 px-2 md:p-0"
    @mouseenter="$emit('mouseenter', $event)"
    @mouseleave="$emit('mouseleave', $event)"
    @keydown="onKeyDown"
    @touchstart="$emit('touchstart', $event)"
    @touchmove="$emit('touchmove', $event)"
    @touchend="$emit('touchend', $event)"
  >
    <ItemActionsGroup :class="listItemActionsDynamicClasses" ref="actions" class="list-item-actions px-2 pt-1 w-2/12 lg:3/12 flex" />
    <div :class="{ 'w-full': !editing }" class="md:ml-8 flex items-start py-1 rounded.lg">
      <div class="pt-1">
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" :class="{ '!border-primary': showActions }" />
      </div>
      <div v-show="!editing && !shouldBeDeleted" @click="startEditing" class="ml-6 w-full text-dark-jungle-green dark:text-gray-300 break-all">
        <ListItemBody :item="item" />
      </div>
    </div>
    <Input v-if="editing && !shouldBeDeleted" v-model="body" @submit="submit" ref="input" class="ml-4" input-classes="px-3 p-1 break-all" />
    <p v-if="shouldBeDeleted" class="bg-blue-500 text-white ml-4 px-3 p-1 w-full break-all">{{ body }}</p>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import ItemActionsGroup from './actions/ItemActionsGroup';
import Item from '@/models/Item';
import Setting from '@/models/Setting';
import ListItemBody from '@/components/items/ListItemBody';
import Input from '@/components/inputs/Input';

export default {
  components: {
    Checkbox,
    ItemActionsGroup,
    ListItemBody,
    Input
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
    }
  },
  data() {
    return {
      editing: false,
      body: this.item.body,
      shouldBeDeleted: false,
      isMobile: screen.width <= 768
    };
  },
  computed: {
    settings() {
      return Setting.query().first();
    },
    listItemActionsDynamicClasses() {
      const classList = [];

      if (this.isMobile && this.showActions) {
        classList.push('show');
        console.log('sh');
      }

      if (!this.isMobile) {
        this.showActions ? classList.push('visible') : classList.push('invisible');
      }

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
      await this.item.updateTags();
    },
    onCompletionStatusChanged() {
      // delete it straight away after completion, if user prefers that
      if (this.item.completed && this.settings.completed_preference === 'clear_immediately') {
        this.item.$delete();
        return;
      }

      this.item.$save();
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
      if (e.keyCode == 46) {
        this.shouldBeDeleted = true;
      }
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

@media only screen and (max-width: 768px) {
  .list-item-actions {
    transition: all 0.15s;
    width: 0;
    opacity: 0;
    padding: 0;
  }

  .list-item-actions.show {
    width: 52px;
    padding: 5px 0px;
    margin-right: 22px;
    display: flex;
    opacity: 100%;
  }
}
</style>
