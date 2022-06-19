<template>
  <NestedMenu :active-menu-id="activeMenuId">
    <div :data-menu-id="menuIds.mainMenu" data-main-menu>
      <BackButton @click="$emit('close')">Back to main settings</BackButton>
      <div class="h-full pl-1">
        <div @click="activeMenuId = menuIds.tagCustomization" class="flex justify-between items-center mt-8 cursor-pointer">
          <span>Tag customization</span>
          <chevronRightIcon class="text-primary" />
        </div>
        <div class="mt-6 flex flex-col">
          <span>If there are no tasks with a tag:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="settings.hide_tags_without_items" />
            <span class="ml-2">Hide these tags</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="settings.hide_tags_without_items" />
            <span class="ml-2">Display these tags anyways</span>
          </label>
        </div>
        <div class="mt-6 flex flex-col">
          <span>If multiple tags are selected, show items that match:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="settings.show_only_items_matching_all_selected_tags" />
            <span class="ml-2">ALL selected tags (“and”)</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="settings.show_only_items_matching_all_selected_tags" />
            <span class="ml-2">ANY selected tags (“or”)</span>
          </label>
        </div>
        <div class="mt-6 flex flex-col">
          <span>Display # of tasks per tag:</span>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="true" v-model="settings.display_number_of_items_per_tag" />
            <span class="ml-2">Yes</span>
          </label>
          <label class="flex items-center pl-1">
            <input @change="onSettingsChanged" type="radio" :value="false" v-model="settings.display_number_of_items_per_tag" />
            <span class="ml-2">No</span>
          </label>
        </div>
      </div>
    </div>
    <CustomTagsOrderMenu :data-menu-id="menuIds.customOrder" @close="activeMenuId =menuIds.mainMenu" class="!p-0"/>
    <TagCustomizationMenu :data-menu-id="menuIds.tagCustomization" @close="activeMenuId =menuIds.mainMenu" class="!p-0"/>
  </NestedMenu>
</template>

<script>
import ChevronRightIcon from '@/assets/images/icons/chevron-right.svg';
import NestedMenu from '@/components/settings/NestedMenu';
import BackButton from '@/components/settings/BackButton';
import CustomTagsOrderMenu from '@/components/settings/submenus/tags/CustomTagsOrderMenu';
import TagCustomizationMenu from '@/components/settings/submenus/tags/TagCustomizationMenu';
import Setting from '@/models/Setting';

export default {
  components: {
    ChevronRightIcon,
    NestedMenu,
    BackButton,
    CustomTagsOrderMenu,
    TagCustomizationMenu
  },
  data() {
    return {
      settings: {},
      menuIds: {
        mainMenu: 'main-menu',
        customOrder: 'custom-order-menu',
        tagCustomization: 'tag-customization-menu',
      },
      activeMenuId: ''
    };
  },
  methods: {
    async onSettingsChanged() {
      this.settings.$save()
    },
    showMainMenu() {
      this.activeMenuId = this.menuIds.mainMenu;
    }
  },
  mounted(){
    this.settings = Setting.query().first();
  }
};
</script>

<style scoped>
  label{
    margin-top: 4px;
    cursor: pointer;
  }
</style>