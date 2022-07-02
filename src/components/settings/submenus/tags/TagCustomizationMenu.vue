<template>
  <NestedMenu :active-menu-id="activeMenuId">
    <div :data-menu-id="menuIds.mainMenu" data-main-menu>
      <BackButton @click="$emit('close')" class="m-3">Tag customization</BackButton>
      <div class="mt-8 px-4">
        <label>Order by:</label>
        <select v-model="settingValues.sort_tags_by" @change="onTagsOrderChange" class="bg-lotion dark:bg-dark-gunmetal p-1 ml-2 text-black dark:text-white">
          <option value="alphabetical_order">Alphabetical order (A-Z)</option>
          <option value="usage_frequency">Usage frequency</option>
          <option value="oldest">Oldest tags first</option>
          <option value="custom_order">Custom order</option>
        </select>
      </div>
      <div class="mt-6 overflow-auto list px-4">
        <div v-for="tag in tags" :key="tag.id" class="flex items-center justify-between mt-2">
          <span :style="tagStyles(tag)" class="px-3 py-1 tag">{{ tag.name }}</span>
          <div class="flex relative">
            <dots-vertical-icon :size="20" @click="showTagOptionsPopup(tag)" class="tag-options-popup-toggle-btn cursor-pointer text-secondary" />
          </div>
        </div>
      </div>
      <TagOptionsPopup
        v-if="openTagOptionsPopup"
        :tag="selectedTag"
        @change-color="onChangeTagColor"
        @delete="onDeleteTag"
        class="tag-options-popup absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
    <CustomTagsOrderMenu :data-menu-id="menuIds.customOrder" @close="activeMenuId = menuIds.mainMenu" class="!p-0" />
  </NestedMenu>
</template>

<script>
import BackButton from '@/components/settings/BackButton';
import Tag from '@/models/Tag';
import ContentSaveAlertOutlineIcon from 'vue-material-design-icons/ContentSaveAlertOutline';
import AutorenewIcon from 'vue-material-design-icons/Autorenew';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical';
import ChangeLogger from '@/sync/ChangeLogger';
import { TAG_COLORS, FALLBACK_TAG_COLOR } from '@/constants';
import TagOptionsPopup from '@/components/settings/submenus/tags/TagOptionsPopup';
import NestedMenu from '@/components/settings/NestedMenu';
import CustomTagsOrderMenu from '@/components/settings/submenus/tags/CustomTagsOrderMenu';
import settings from '@/mixins/settings';

export default {
  components: {
    BackButton,
    ContentSaveAlertOutlineIcon,
    AutorenewIcon,
    DotsVerticalIcon,
    TagOptionsPopup,
    NestedMenu,
    CustomTagsOrderMenu
  },
  data() {
    return {
      selectedTag: null,
      openTagOptionsPopup: false,
      colorList: TAG_COLORS,
      menuIds: {
        mainMenu: 'main-menu',
        customOrder: 'custom-order-menu'
      },
      activeMenuId: ''
    };
  },
  computed: {
    tags() {
      return Tag.getOrderedTags();
    }
  },
  methods: {
    showTagOptionsPopup(tag) {
      if (this.openTagOptionsPopup && this.selectedTag.id == tag.id) {
        this.closeTagOptionsPopup();
        return;
      }

      this.selectedTag = tag;
      this.openTagOptionsPopup = true;
    },
    closeTagOptionsPopup() {
      this.selectedTag = null;
      this.openTagOptionsPopup = false;
    },
    async onChangeTagColor(selectedColor) {
      this.selectedTag.color = selectedColor;
      await this.selectedTag.$save();
      await ChangeLogger.tagPropertyValueChanged(this.selectedTag.id, 'color', selectedColor);

      this.closeTagOptionsPopup();
    },
    async onDeleteTag() {
      this.$notify({
        group: 'prompt',
        title: 'Delete',
        text: `You are about to delete "${this.selectedTag.name}" from your tags. Do you want to proceed?`,
        data: {
          actions: [
            {
              label: 'Cancel',
              callback: async close => {
                close();
                this.closeTagOptionsPopup();
              }
            },
            {
              label: 'Yes',
              callback: async close => {
                const tagId = this.selectedTag.id
                await this.selectedTag.$delete();
                await ChangeLogger.entityDeleted('tag', tagId);
                close();
                this.closeTagOptionsPopup();
              }
            }
          ]
        }
      });
    },
    onTagsOrderChange() {
      if (this.settingValues.sort_tags_by == 'custom_order') {
        this.activeMenuId = this.menuIds.customOrder;
      }

      this.updateSettings();
    },
    tagStyles(tag) {
      const obj = {};
      // default
      obj['background-color'] = FALLBACK_TAG_COLOR;

      if (tag.color) {
        obj['background-color'] = tag.color;
      }

      return obj;
    }
  },
  mounted() {
    document.body.addEventListener('click', e => {
      if (e.target.matches('.tag-options-popup-toggle-btn') || e.target.matches('.tag-options-popup-toggle-btn *')) return;
      if (e.target.matches('.tag-options-popup *')) return;

      this.openTagOptionsPopup = false;
      this.selectedTag = null;
    });
  },
  mixins: [settings]
};
</script>

<style scoped>
.tag {
  color: #000;
  border-radius: 5px;
}

.list {
  height: calc(100% - 78px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
