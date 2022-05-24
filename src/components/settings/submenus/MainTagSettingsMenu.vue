<template>
  <NestedMenu :active-menu-id="activeMenuId">
    <div :data-menu-id="menuIds.mainMenu" data-main-menu>
      <BackButton @click="$emit('close')">Back to main settings</BackButton>
      <div class="h-full pl-1">
        <div class="flex justify-between items-center mt-8 cursor-pointer">
          <span>Customize tag colors</span>
          <chevronRightIcon class="text-primary" />
        </div>
        <div class="mt-6 flex flex-col">
          <span>Display tags by:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" value="alphabetical_order" v-model="currentSettings.sort_tags_by" />
            <span class="ml-2">Alphabetical order (A-Z)</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" value="usage_frequency" v-model="currentSettings.sort_tags_by" />
            <span class="ml-2">Most frequently used first</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" value="oldest" v-model="currentSettings.sort_tags_by" />
            <span class="ml-2">Oldest tags first</span>
          </label>
        </div>
        <div class="mt-6 flex flex-col">
          <span>If there are no tasks with a tag:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.hide_tags_without_items" />
            <span class="ml-2">Hide these tags</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.hide_tags_without_items" />
            <span class="ml-2">Display these tags anyways</span>
          </label>
        </div>
        <div class="mt-6 flex flex-col">
          <span>If multiple tags are selected, show items that match:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.show_only_items_matching_all_selected_tags" />
            <span class="ml-2">ALL selected tags (“and”)</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.show_only_items_matching_all_selected_tags" />
            <span class="ml-2">ANY selected tags (“or”)</span>
          </label>
        </div>
        <div class="mt-6 flex flex-col">
          <span>Display # of tasks per tag:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.display_number_of_items_per_tag" />
            <span class="ml-2">Yes</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.display_number_of_items_per_tag" />
            <span class="ml-2">No</span>
          </label>
        </div>
      </div>
    </div>
  </NestedMenu>
</template>

<script>
import ChevronRightIcon from '@/assets/images/icons/chevron-right.svg';
import NestedMenu from '@/components/settings/NestedMenu';
import BackButton from '@/components/settings/BackButton';

export default {
  components: {
    ChevronRightIcon,
    NestedMenu,
    BackButton
  },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentSettings: this.settings,
      menuIds: {
        mainMenu: 'main-menu',
        reorderingMenu: 'reordering-menu'
      },
      activeMenuId: ''
    };
  },
  methods: {
    async onSettingsChanged() {
      this.$emit('settings-updated', this.currentSettings);
    },
    showMainMenu() {
      this.activeMenuId = this.menuIds.mainMenu;
      setTimeout(() => {
        this.showDropdownToggleButton = true;
      }, 400);
    }
  }
};
</script>
