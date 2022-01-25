<template>
  <div class="w-9/12 mt-16">
    <div class="ml-72">
      <TagGroup />
    </div>
    <div class="mt-8">
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
import { mapActions, mapGetters } from 'vuex';
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
      drag: false
    };
  },
  methods: {
    ...mapActions({
      getItems: 'items/getItems',
      updateItems: 'items/updateItems'
    })
  },
  computed: {
    ...mapGetters({
      items: 'items/items'
    }),
    list: {
      get() {
        return this.items;
      },
      set(value) {
        const reorderedItems = value.map((item, index) => {
          item.order = index;
          return item;
        });
        this.updateItems(reorderedItems);
      }
    }
  },
  mounted() {
    this.getItems();
  }
};
</script>

<style>
[draggable='true'] {
  opacity: 0.5;
}
</style>
