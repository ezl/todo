<template>
  <div class="flex justify-start items-center list-item-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @keydown="onKeyDown">
    <ItemActionsGroup :class="{ visible: showActions, invisible: !showActions }" />
    <div :class="{ 'w-full': !editing }" class="list-item-content flex items-center py-1 rounded.lg">
      <div>
        <Checkbox v-model="item.completed" @click="onCompletionStatusChanged" :class="{ '!border-primary': showActions }" />
      </div>
      <div v-show="!editing && !shouldBeDeleted" @click="startEditing" class="ml-6 w-full text-dark-jungle-green dark:text-gray-300 break-normal">
        <ListItemBody :item="item" />
      </div>
    </div>
    <Input v-if="editing && !shouldBeDeleted" v-model="body" @submit="submit" ref="input" class="ml-4" input-classes="px-3 p-1" />
    <p v-if="shouldBeDeleted" class="bg-blue-500 text-white ml-4 px-3 p-1 w-full">{{ body }}</p>
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
    }
  },
  data() {
    return {
      showActions: false,
      editing: false,
      body: this.item.body,
      shouldBeDeleted: false
    };
  },
  computed: {
    settings() {
      return Setting.query().first();
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
    onMouseEnter() {
      if (this.dragging === false) this.showActions = true;

      document.querySelector('.action-labels').style.visibility = 'visible';
    },
    onMouseLeave() {
      if (this.dragging === false) this.showActions = false;

      document.querySelector('.action-labels').style.visibility = 'hidden';
    },
    startEditing() {
      this.editing = true;
      this.$emit('started-editing', this.item.id);
    },
    async stopEditing() {
      if (this.shouldBeDeleted) {
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
</style>
