<template>
  <div class="w-full lg:w-8/12 lg:ml-20 mt-8 md:mt-16">
    <div v-show="(isMobile || isTablet) && selectedItems.length" class="z-50 fixed inset-x-0 top-0 p-4 bg-lotion dark:bg-dark-gunmetal flex justify-end">
      <button @click="clearSelectedItems">cancel</button>
    </div>
    <div class="flex px-2">
      <div
        :class="actionLabelsWrapperDynamicClasses"
        class="list-item-action-labels hidden lg:flex flex-shrink-0 justify-between items-center italic dark:text-white text-black h-8"
      >
        <span class="text-xs text-secondary opacity-60">discard</span>
        <span class="text-xs text-secondary opacity-60">snooze</span>
        <span v-if="!selectedItems.length" class="text-xs text-secondary opacity-60">select</span>
        <button @click="clearSelectedItems" v-else class="unselect-btn">
          <close-icon :size="18" class="text-primary" />
        </button>
        <span class="text-xs text-secondary opacity-60 ">drag</span>
      </div>
      <div :class="{'blur-sm pointer-events-none': isMobile && selectedItems.length}" class="flex relative items-center w-full ml-0 lg:ml-8">
        <SearchInput v-if="shouldShowSearchIcon" v-model="listItemSearchQuery" :results-count="items.length" @toggled="onSearchModeToggled" />
        <TaskFilterTags v-if="!inSearchMode" :class="{'ml-4': shouldShowSearchIcon}" />
      </div>
    </div>
    <div class="mt-3 lg:mt-8 list-items-container  overflow-x-hidden">
      <ListItemForm v-if="isTablet || !isMobile && !isTouchDevice" ref="form" :class="{'invisible': inSearchMode}" class="list-item-form px-2 lg:pl-10" />
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
            @snooze="snoozeSelectedItems"
            @discard="discardSelectedItems"
            @begin-action="pendingActionItemId = item.id"
            @end-action="pendingActionItemId = null"
            :selected="isItemSelected(item)"
            :interactable="isItemInteractable(item)"
            :in-multi-selection-mode="selectedItems.length > 0"
            :class="{ 'select-none': holdingTouch }"
          />
        </transition-group>
      </draggable>
    </div>
    <div v-if="(isMobile || isTablet) && selectedItems.length" class="flex items-center fixed inset-x-0 bottom-0 p-4 bg-lotion dark:bg-dark-gunmetal z-40">
      <SnoozeAction @snooze="snoozeSelectedItems"/>
      <DiscardAction @discard="discardSelectedItems" class="ml-4"/>
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
import Item from '@/models/Item';
import Tag from '@/models/Tag';
import Setting from '@/models/Setting';
import draggable from 'vuedraggable';
import SearchInput from '@/components/inputs/SearchInput';
import SnoozeAction from '@/components/items/actions/SnoozeAction';
import DiscardAction from '@/components/items/actions/DiscardAction';
import CloseIcon from 'vue-material-design-icons/Close';
import ChangeLogger from '../sync/ChangeLogger';
import { isUtcDateInFuture } from '@/helpers/datetime';
import screenSize from '@/mixins/screen-size';
import TaskFilterTags from '../components/task-filters/TaskFilterTags';

export default {
  components: {
    ListItemForm,
    ListItemMobileForm,
    ListItemMobileFormToggleButton,
    ListItem,
    draggable,
    SearchInput,
    SnoozeAction,
    DiscardAction,
    CloseIcon,
    TaskFilterTags
  },
  data() {
    return {
      dragging: false,
      selectedTagsIds: [],
      itemBeingEditedId: null,
      listItemSearchQuery: '',
      longTouchTimeoutId: null,
      visibleActionsItemId: null,
      showActionLabels: false,
      holdingTouch: false,
      selectedItems: [],
      orderedSelectedItems: [],
      itemsMarkedAsCompletedIds: [],
      openItemCreationFormForMobile: false,
      inSearchMode: false,
      pendingActionItemId: null // The id of the task that currently has an action pending (started but not completed yet)
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

      // Ignore if an item’s snooze popup is currently visible 
      if(document.querySelector('.snooze-period-options')){
        return
      }

      if (this.dragging === false) {
        this.visibleActionsItemId = item.id;
      }

      this.showActionLabels = true;
    },
    onMouseLeave(item) {
      if (this.isMobile) return;

      // Ignore if an item’s snooze popup is currently visible 
      if(document.querySelector('.snooze-period-options')){
        return
      }

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
    isItemInteractable(item) {
      // It cannot be interacted with, if there’s an item which has an action being executed currently 
      // and it is not that that item
      if(this.pendingActionItemId != null && this.pendingActionItemId != item.id) return false

      return true
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
      this.pendingActionItemId = null
    },
    onItemCompletionStatusChanged(item) {
      if (item.completed_at) {
        this.itemsMarkedAsCompletedIds.push(item.id);
      } else {
        this.itemsMarkedAsCompletedIds = this.itemsMarkedAsCompletedIds.filter(id => id != item.id);
      }
    },
    onSearchModeToggled(toggled){
      this.inSearchMode = toggled

      // Making sure to set focus on task creation input when search input is closed by hitting the escape key
      if(!this.inSearchMode) {
        this.$nextTick(() => this.$refs.form.setFocusOnInput())
      }
    },
    snoozeSelectedItems(periodInDays){
      // First make sure we are in multi-selection mode
      if(!this.selectedItems.length) return

      const fadeOutAnimationDuration = 350
      const snoozedItemsCount = this.selectedItems.length

      // Snooze all selected items in multi-selection mode
      for (const item of this.selectedItems) {
        // Get reference to this item’s Vue component
        const component = this.$refs[`item-${item.id}`][0];
        // Let it fade out
        component.$el.classList.add('fade-out')
        // Snooze it after it fades out
        setTimeout(() => item.snooze(periodInDays), fadeOutAnimationDuration);
      }


      setTimeout(() => {
        this.$notify({
          group: 'basic',
          title: 'Snoozed',
          text: `Successfully snoozed ${snoozedItemsCount} tasks!`
        });
        
        this.clearSelectedItems()
      }, fadeOutAnimationDuration);
    },
    discardSelectedItems(){
      // Return if we are not in multi-selection mode
      if(!this.selectedItems.length) return

      const discardedItemsCount = this.selectedItems.length
      const fadeOutAnimationDuration = 350

      // Discard all selected items
      for (const item of this.selectedItems) {
        const component = this.$refs[`item-${item.id}`][0];
        
        component.$el.classList.add('fade-out')
        
        // Wait for the component to fade out
        setTimeout(() => item.discard(), fadeOutAnimationDuration);
      }


      setTimeout(() => {
        this.$notify({
          group: 'basic',
          title: 'Discard',
          text: `Successfully discarded ${discardedItemsCount} tasks!`
        });

        this.clearSelectedItems()
      }, fadeOutAnimationDuration);
    }
  },
  computed: {
    items() {
      let items = Item.query()
        .with('tags')
        .with('item_user_pivot')
        .with('users')
        .where('discarded_at', null)
        .where('snoozed_until', value => value === null || isUtcDateInFuture(value) === false)
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
        .has('items') // Retrieve all tags that have at least one task
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

      if (this.isMobile || this.isTablet) {
        classList.push('hidden');
      }

      return classList;
    },
    slideInActions() {
      return (this.isMobile || this.isTablet) && this.selectedItems.length;
    },
    isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    },
    settings(){
      return Setting.retrieve()
    },
    shouldShowSearchIcon(){
      return this.inSearchMode || this.selectedTagIds.length && this.items.length > 5 || this.items.length > 5
    }
  },
  mounted() {
    document.body.addEventListener('click', e => {
      if (!this.itemBeingEditedId) return;

      const itemComponentRef = this.$refs[`item-${this.itemBeingEditedId}`][0];

      if (itemComponentRef.$el.contains(e.target)) return;
      if (e.target.matches('.suggestion-box-option')) return;
      itemComponentRef.stopEditing();
      this.itemBeingEditedId = null;
    });
  },
  mixins: [screenSize]
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

.list-item-action-labels{
  width: 168px;
  padding-left: 10px;
}

.list-item-form{
  margin-left: 171px;
}

@media only screen and (max-width: 900px) {
  .slide-in-actions {
    @apply !transition-transform !duration-500;
    transform: translateX(calc(79px));
  }
  .slide-out-actions {
    @apply !transition-transform !duration-500;
    transform: translateX(calc(0px));
  }
  .list-item-form{
    margin-left: 0;
  }
}
</style>
