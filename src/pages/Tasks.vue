<template>
  <div class="w-full lg:w-8/12 lg:ml-20 mt-8 md:mt-16">
    <div v-show="isMobile && selectedItems.length" class="z-50 fixed inset-x-0 top-0 p-4 bg-lotion dark:bg-dark-gunmetal flex justify-end">
      <button @click="clearSelectedItems">cancel</button>
    </div>
    <div class="flex px-2">
      <div
        :class="actionLabelsWrapperDynamicClasses"
        class="w-2/12 lg:3/12 hidden md:flex flex-shrink-0 justify-between items-center italic dark:text-white text-black h-8"
      >
        <span class="text-xs text-secondary opacity-60">snooze</span>
        <span v-if="!selectedItems.length" class="text-xs text-secondary opacity-60">select</span>
        <button @click="clearSelectedItems" v-else class="unselect-btn">
          <close-icon :size="18" class="text-primary" />
        </button>
        <span class="text-xs text-secondary opacity-60 ">drag</span>
      </div>
      <div class="flex relative items-start	w-full ml-0 md:ml-8">
        <SearchInput v-model="listItemSearchQuery" :results-count="items.length" />
        <TagGroup class="ml-3" />
      </div>
    </div>
    <div class="mt-3 md:mt-8 list-items-container">
      <ListItemForm v-if="!isMobile && !isTouchDevice" class="w-full md:w-10/12 lg:9/12 mr-0 m-auto px-2 pr-7 md:px-2 md:pl-10" />
      <draggable
        :class="listItemsWrapperDynamicClasses"
        :animation="100"
        :disabled="false"
        :force-fallback="true"
        v-model="list"
        handle=".handle"
        @start="onStartedDragging"
        @end="onEndedDragging"
        @change="onItemsOrderChanged"
      >
        <transition-group type="transition" name="items">
          <ListItem
            v-show="!dragging || (dragging && !isItemSelected(item)) || selectedItems[0].id == item.id"
            v-for="item in items"
            :key="item.id"
            :item="item"
            :ref="`item-${item.id}`"
            :show-actions="shouldShowItemActions(item)"
            @started-editing="onStartedEditingItem"
            @finished-editing="onFinishedEditingItem"
            @touchstart="onTouchStart($event, item)"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd($event, item)"
            @mouseenter="onMouseEnter(item)"
            @mouseleave="onMouseLeave(item)"
            @selection-changed="onItemSelectionChanged"
            @completion-status-changed="onItemCompletionStatusChanged"
            :selected="isItemSelected(item)"
            :class="{ 'select-none': holdingTouch }"
          />
        </transition-group>
      </draggable>
    </div>
    <div v-show="isMobile && selectedItems.length" class="fixed inset-x-0 bottom-0 p-4 bg-lotion dark:bg-dark-gunmetal z-40">
      <SnoozeAction />
    </div>
    <ListItemMobileForm v-if="openItemCreationFormForMobile" @close="openItemCreationFormForMobile = false" />
    <ListItemMobileFormToggleButton v-model="openItemCreationFormForMobile" v-if="!selectedItems.length && isTouchDevice" />
  </div>
</template>

<script>
import ListItemMobileForm from '@/components/items/mobile-form/ListItemMobileForm';
import ListItemMobileFormToggleButton from '@/components/items/mobile-form/ListItemMobileFormToggleButton';
import ListItemForm from '@/components/items/ListItemForm';
import ListItem from '@/components/items/ListItem';
import TagGroup from '@/components/tags/TagGroup';
import Item from '@/models/Item';
import Tag from '@/models/Tag';
import Setting from '@/models/Setting';
import draggable from 'vuedraggable';
import SearchInput from '@/components/inputs/SearchInput';
import SnoozeAction from '@/components/items/actions/SnoozeAction';
import CloseIcon from 'vue-material-design-icons/Close';
import ChangeLogger from '../sync/ChangeLogger';

export default {
  components: {
    ListItemForm,
    ListItemMobileForm,
    ListItemMobileFormToggleButton,
    ListItem,
    TagGroup,
    draggable,
    SearchInput,
    SnoozeAction,
    CloseIcon
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
      holdingTouch: false,
      selectedItems: [],
      orderedSelectedItems: [],
      itemsMarkedAsCompletedIds: [],
      openItemCreationFormForMobile: false,
    };
  },
  methods: {
    onStartedEditingItem(itemId) {
      if (this.itemBeingEditedId) {
        const itemComponentRef = this.$refs[`item-${this.itemBeingEditedId}`][0];
        itemComponentRef.stopEditing();
      }

      this.itemBeingEditedId = itemId;
      if (this.isMobile) this.clearSelectedItems();
    },
    onFinishedEditingItem() {
      this.itemBeingEditedId = null;
    },
    onTouchStart(e, item) {
      this.longTouchTimeoutId = setTimeout(() => this.onLongTouch(item), 500);
      this.holdingTouch = true;
    },
    onTouchMove(e) {
      clearTimeout(this.longTouchTimeoutId);
      this.longTouchTimeoutId = null;
    },
    onTouchEnd(e, item) {
      clearTimeout(this.longTouchTimeoutId);
      this.longTouchTimeoutId = null;
      this.holdingTouch = false;
    },
    onLongTouch(item) {
      this.selectedItems.push(item);
    },
    onMouseEnter(item) {
      if (this.isMobile) return;

      if (this.selectedItems.length) return;

      if (this.dragging) return;

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
    },
    onItemSelectionChanged({ selected, item }) {
      if (selected) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = this.selectedItems.filter(_item => _item.id != item.id);
      }

      this.orderedSelectedItems = [...this.selectedItems].sort((a, b) => a.order - b.order);
    },
    onItemsOrderChanged(data) {
      if (!data.moved || this.selectedItems.length === 0) return;

      let precedingItems = [];
      let followingItems = [];
      let droppedItem = data.moved.element;
      let droppedItemIndexInSelectedItemsArray;

      // Get index of the item that was dropped in selectedItems array
      this.selectedItems.find((item, index) => {
        if (item.id === droppedItem.id) {
          droppedItemIndexInSelectedItemsArray = index;
        }
      });
      // Where we’ll place the items that were selected/dropped in the list
      const dropIndex = data.moved.newIndex - droppedItemIndexInSelectedItemsArray;

      // If the selected items were moved to the beginning of the list
      if (dropIndex == 0) {
        followingItems = this.items.filter(item => !this.isItemSelected(item));
      }

      // If the selected items were dropped somewhere in the middle of the list
      if (dropIndex > 0 && dropIndex < this.items.length - 1) {
        precedingItems = this.items.slice(0, dropIndex);
        followingItems = this.items.slice(dropIndex).filter(item => !this.isItemSelected(item));
      }

      // If the selected items were dropped at the end of the list
      if (dropIndex === this.items.length - 1) {
        precedingItems = this.items.slice(0, dropIndex + 1).filter(item => !this.isItemSelected(item));
      }

      const newReorderedListItems = [...precedingItems, ...this.orderedSelectedItems, ...followingItems];

      this.list = newReorderedListItems;
    },
    shouldShowItemActions(item) {
      if (this.visibleActionsItemId === item.id && !this.selectedItems.length) return true;

      if (this.selectedItems.length && this.selectedItems[0].id === item.id) return true;
    },
    isItemSelected(item) {
      return this.selectedItems.some(_item => _item.id == item.id);
    },
    onStartedDragging(e) {
      this.dragging = true;

      if (this.selectedItems.length > 1) {
        const draggableElement = document.querySelector('.sortable-drag');
        draggableElement.querySelector('.body').innerHTML = this.selectedItems.length + ' items...';
      }
    },
    onEndedDragging(e) {
      this.dragging = false;
    },
    clearSelectedItems() {
      this.selectedItems = [];
    },
    onItemCompletionStatusChanged(item) {
      if (item.completed_at) {
        this.itemsMarkedAsCompletedIds.push(item.id);
      } else {
        this.itemsMarkedAsCompletedIds = this.itemsMarkedAsCompletedIds.filter(id => id != item.id);
      }
    }
  },
  computed: {
    items() {
      let items = Item.query()
        .with('tags')
        .get()
        .sort((a, b) => a.order - b.order);

      items = items.filter(item => {
        // If there are any selected tags
        if (this.selectedTagIds.length) {
          if (this.settings.show_only_items_matching_all_selected_tags) {
            let numOfMatchedTags = 0;
            item.tags.forEach(tag => {
              if (this.selectedTagIds.includes(tag.id)) numOfMatchedTags++;
            });
            if (numOfMatchedTags != this.selectedTagIds.length) return false;
          } else {
            const matchesAnySelectedTags = item.tags.some(tag => this.selectedTagIds.includes(tag.id));
            if (!matchesAnySelectedTags) return false;
          }
        }

        if (this.listItemSearchQuery != '') {
          const matchesCurrentSearchTerm = item.body.toLowerCase().includes(this.listItemSearchQuery.toLowerCase());
          if (!matchesCurrentSearchTerm) return false;
        }

        if (this.settings.completed_preference == 'strikethrough_until_refresh') {
          // Keep showing items that get marked as completed until the next time this component is loaded,
          // and hide items that were previously marked as completed
          const shouldBeHidden = item.completed_at != null && !this.itemsMarkedAsCompletedIds.includes(item.id);
          if (shouldBeHidden) return false;
        }

        return true;
      });

      return items;
    },
    selectedTagIds() {
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
        const newOrders = {};

        items.forEach((item, index) => {
          const order = index + 1;
          item.order = order;
          item.$save();
          newOrders[item.id] = order;
        });

        ChangeLogger.itemOrdersChanged(newOrders);
      }
    },
    listItemsWrapperDynamicClasses() {
      const classList = [];

      if (this.slideInActions) {
        classList.push('slide-in-actions');
      } else {
        classList.push('slide-out-actions');
      }

      if (this.selectedItems.length) {
        classList.push('items-selection-mode');
      }

      return classList;
    },
    actionLabelsWrapperDynamicClasses() {
      const classList = [];

      if (!this.showActionLabels && this.selectedItems.length === 0) {
        classList.push('invisible');
      }

      if (this.isMobile) {
        classList.push('hidden');
      }

      return classList;
    },
    slideInActions() {
      return this.isMobile && this.selectedItems.length;
    },
    isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },
    settings(){
      return Setting.retrieve()
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

.sortable-ghost {
  @apply bg-primary;
  height: 5px;
  overflow: hidden;
  opacity: 0.3;
}

.unselect-btn {
  border-style: solid;
  border-width: 2px;
  @apply border-primary;
  @apply text-primary;
}

@media only screen and (max-width: 768px) {
  .slide-in-actions {
    @apply !transition-transform !duration-500;
    transform: translateX(calc(68px));
  }
  .slide-out-actions {
    @apply !transition-transform !duration-500;
    transform: translateX(calc(0px));
  }
}
</style>
