<template>
  <div class="w-9/12 mt-16">
    <div class="ml-72">
      <TagGroup @select="onSelectedTagsChanged" />
    </div>
    <div class="mt-4">
      <ListItemForm class="ml-72" />
      <draggable :animation="100" :disabled="false" v-model="list" handle=".handle" @start="drag = true" @end="drag = false">
        <transition-group type="transition" name="items">
          <ListItem v-for="item in items" :key="item.id" :item="item" class="mt-3" :dragging="drag" />
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
      this.selectedTagsIds = selectedTagsIds
    }
  },
  computed: {
    items() {
      let items = Item.query()
        .with('tags')
        .get()
        .sort((a, b) => a.order - b.order)

        if(items && this.selectedTagsIds.length){
          items = items.filter(item => {
            return item.tags.some(tag => this.selectedTagsIds.includes(tag.id))
          })
        }

        return items
    },
    list: {
      get() {
        return this.items
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
</style>
