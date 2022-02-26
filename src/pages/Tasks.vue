<template>
  <div class="w-9/12 mt-16">
    <div class="flex">
      <div class="action-labels flex flex-shrink-0 justify-between items-center pl-16 pr-5 italic dark:text-white text-black opacity-60">
        <span class="text-xs text-gray-400">snooze</span>
        <span class="text-xs text-gray-400">pomo</span>
        <span class="text-xs text-gray-400">select</span>
        <span class="text-xs text-gray-400">drag</span>
      </div>
      <TagGroup @select="onSelectedTagsChanged" />
    </div>
    <div class="mt-4 list-items-container">
      <ListItemForm />
      <draggable :animation="100" :disabled="false" v-model="list" handle=".handle" @start="drag = true" @end="drag = false">
        <transition-group type="transition" name="items">
          <ListItem v-for="item in items" :key="item.id" :item="item" :dragging="drag" />
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
      selectedTagsIds: []
    };
  },
  methods: {
    onSelectedTagsChanged(selectedTagsIds) {
      this.selectedTagsIds = selectedTagsIds;
    }
  },
  computed: {
    items() {
      let items = Item.query()
        .with('tags')
        .get()
        .sort((a, b) => a.order - b.order);

      if (items && this.selectedTagsIds.length) {
        items = items.filter(item => {
          return item.tags.some(tag => this.selectedTagsIds.includes(tag.id));
        });
      }

      return items;
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

.list-items-container{
  margin-left: 50px;
}
</style>
