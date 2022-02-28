<template>
  <div class="w-9/12 mt-16">
    <div class="flex">
      <div class="action-labels flex flex-shrink-0 justify-between items-center pl-16 pr-5 italic dark:text-white text-black opacity-60">
        <span class="text-xs text-gray-400">snooze</span>
        <span class="text-xs text-gray-400">pomo</span>
        <span class="text-xs text-gray-400">select</span>
        <span class="text-xs text-gray-400">drag</span>
      </div>
      <TagGroup />
    </div>
    <div class="mt-4 list-items-container">
      <ListItemForm />
      <draggable :animation="100" :disabled="false" v-model="list" handle=".handle" @start="drag = true" @end="drag = false">
        <transition-group type="transition" name="items">
          <ListItem v-for="item in items" :key="item.id" :item="item" :dragging="drag" :ref="`item-${item.id}`" @started-editing="onStartedEditingItem" @finished-editing="onFinishedEditingItem" />
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script>
import ListItemForm from '@/components/items/ListItemForm';
import ListItem from '@/components/items/ListItem';
import TagGroup from '@/components/tags/TagGroup';
import Item from '@/models/Item';
import Tag from '@/models/Tag';
import draggable from 'vuedraggable';

export default {
  components: {
    ListItemForm,
    ListItem,
    TagGroup,
    draggable
  },
  data() {
    return {
      drag: false,
      selectedTagsIds: [],
      itemBeingEditedId: null
    };
  },
  methods: {
    onStartedEditingItem(itemId) {
      if (this.itemBeingEditedId) {
        const itemComponentRef = this.$refs[`item-${this.itemBeingEditedId}`][0];
        itemComponentRef.stopEditing()
      }

      this.itemBeingEditedId = itemId;
    },
    onFinishedEditingItem() {
      this.itemBeingEditedId = null;
    },
  },
  computed: {
    items() {
      let items = Item.query()
        .with('tags')
        .get()
        .sort((a, b) => a.order - b.order);

      if (items && this.toggledTagsIds.length) {
        items = items.filter(item => {
          return item.tags.some(tag => this.toggledTagsIds.includes(tag.id));
        });
      }

      return items;
    },
    toggledTagsIds(){
      return Tag.query().where('toggled', true).get().map(t => t.id)
    },
    list: {
      get() {
        return this.items;
      },
      set(items) {
        items.forEach((item, index) => {
          item.order = index + 1;
          item.$save();
        });
      }
    }
  },
  mounted() {
    document.body.addEventListener('click', e => {
      if (!this.itemBeingEditedId) return;

      const itemComponentRef = this.$refs[`item-${this.itemBeingEditedId}`][0];

      if (itemComponentRef.$el.contains(e.target)) return;
      if (e.target.matches('.tag-suggestion')) return;
      itemComponentRef.stopEditing()
      this.itemBeingEditedId = null;
    });
  }
};
</script>

<style>
[draggable='true'] {
  opacity: 0.5;
}

.action-labels {
  width: 288px;
  visibility: hidden;
}

.list-items-container {
  margin-left: 50px;
}
</style>
