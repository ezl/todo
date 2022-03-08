<template>
  <div class="w-full lg:w-8/12 lg:ml-20 mt-8 md:mt-16">
    <div v-show="isMobile && visibleActionsItemId" class="z-50 absolute inset-x-0 top-0 p-4 bg-lotion dark:bg-dark-gunmetal flex justify-end">
      <button @click="visibleActionsItemId = null">cancel</button>
    </div>
    <div class="flex px-2">
      <div
        :class="{ invisible: !showActionLabels, hidden: isMobile }"
        class="w-2/12 lg:3/12 hidden md:flex flex-shrink-0 justify-between items-center italic dark:text-white text-black opacity-60 h-8"
      >
        <span class="text-xs text-gray-400">snooze</span>
        <span class="text-xs text-gray-400">select</span>
        <span class="text-xs text-gray-400">drag</span>
      </div>
      <div class="flex relative items-start	w-full ml-0 md:ml-8">
        <div class="absolute -left-12 hover:opacity-100 opacity-60">
          <TagMenu />
        </div>
        <SearchInput v-model="listItemSearchQuery" :results-count="items.length" />
        <TagGroup class="ml-3" />
      </div>
    </div>
    <div class="mt-3 md:mt-8 list-items-container">
      <ListItemForm class="w-full md:w-10/12 lg:9/12 mr-0 m-auto px-2 md:px-2 md:pl-8" />
      <draggable :animation="100" :disabled="false" v-model="list" handle=".handle" @start="dragging = true" @end="dragging = false">
        <transition-group type="transition" name="items">
          <ListItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            :ref="`item-${item.id}`"
            :show-actions="visibleActionsItemId === item.id"
            @started-editing="onStartedEditingItem"
            @finished-editing="onFinishedEditingItem"
            @touchstart="onTouchStart(item)"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @mouseenter="onMouseEnter(item)"
            @mouseleave="onMouseLeave(item)"
            :class="{ 'select-none': holdingTouch }"
          />
        </transition-group>
      </draggable>
    </div>
    <div v-show="isMobile && visibleActionsItemId" class="absolute inset-x-0 bottom-0 p-4 bg-lotion dark:bg-dark-gunmetal z-40">
      <SnoozeAction />
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
import TagMenu from '@/components/tags/TagMenu';
import SearchInput from '@/components/inputs/SearchInput';
import SnoozeAction from '@/components/items/actions/SnoozeAction';

export default {
  components: {
    ListItemForm,
    ListItem,
    TagGroup,
    draggable,
    TagMenu,
    SearchInput,
    SnoozeAction
  },
  data() {
    return {
      dragging: false,
      selectedTagsIds: [],
      itemBeingEditedId: null,
      listItemSearchQuery: '',
      isMobile: screen.width <= 768,
      longTouchTimeoutId: null,
      visibleActionsItemId: null,
      showActionLabels: false,
      holdingTouch: false
    };
  },
  methods: {
    onStartedEditingItem(itemId) {
      if (this.itemBeingEditedId) {
        const itemComponentRef = this.$refs[`item-${this.itemBeingEditedId}`][0];
        itemComponentRef.stopEditing();
      }

      this.itemBeingEditedId = itemId;
      if (this.isMobile) this.visibleActionsItemId = null;
    },
    onFinishedEditingItem() {
      this.itemBeingEditedId = null;
    },
    onTouchStart(item) {
      this.longTouchTimeoutId = setTimeout(() => this.onLongTouch(item), 800);
      this.holdingTouch = true;
    },
    onTouchMove(e) {
      clearTimeout(this.longTouchTimeoutId);
      this.longTouchTimeoutId = null;
    },
    onTouchEnd(e) {
      clearTimeout(this.longTouchTimeoutId);
      this.longTouchTimeoutId = null;
      this.holdingTouch = false;
    },
    onLongTouch(item) {
      this.visibleActionsItemId = item.id;
    },
    onMouseEnter(item) {
      if (this.isMobile) return;

      if (this.dragging === false) {
        this.visibleActionsItemId = item.id;
      }

      this.showActionLabels = true;
    },
    onMouseLeave(item) {
      if (this.isMobile) return;

      if (this.dragging === false) {
        this.visibleActionsItemId = null;
      }

      this.showActionLabels = false;
    }
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

      if (this.listItemSearchQuery != '') {
        items = items.filter(item => item.body.toLowerCase().includes(this.listItemSearchQuery.toLowerCase()));
      }

      return items;
    },
    toggledTagsIds() {
      return Tag.query()
        .where('toggled', true)
        .get()
        .map(t => t.id);
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
      itemComponentRef.stopEditing();
      this.itemBeingEditedId = null;
    });
  }
};
</script>

<style>
[draggable='true'] {
  opacity: 0.5;
}
</style>
