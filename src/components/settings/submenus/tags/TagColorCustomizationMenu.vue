<template>
  <div>
    <BackButton @click="$emit('close')" class="m-3">Tag color customization</BackButton>
    <div class="list px-4">
      <div v-for="tag in tags" :key="tag.id" class="flex items-center justify-between mt-2">
        <span :style="tagStyles(tag)" class="px-3 py-1 tag">{{ tag.name }}</span>
        <div class="flex relative">
          <dots-vertical-icon :size="20" @click="onToggleTagColorSelectionMenu(tag)" class="dropdown-toggle-btn cursor-pointer text-gray-500" />
          <ul
            v-show="openColorSelectionDropdownMenu && selectedTagId == tag.id"
            class="bg-lotion dark:bg-dark-gunmetal z-20 p-3 text-xs dropdown w-48 absolute top-5 right-0"
          >
            <li class="mb-1 text-gray-400">Colors</li>
            <li
              @click="onTagColorSelected(tag.id, color.hexValue)"
              v-for="(color, index) in colorList"
              :key="index"
              class="flex items-center justify-between mt-3 cursor-pointer"
            >
              <div class="flex items-center">
                <span class="w-5 h-5 block" :style="{ 'background-color': color.hexValue }"></span>
                <span class="ml-4">{{ color.name }}</span>
              </div>
              <check-icon v-if="tag.color ? tag.color == color.hexValue : defaultColor == color.hexValue" :size="16" />
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="actions">
      <button @click="save" class="flex items-center px-4 py-2 w-full hover:text-primary">
        <content-save-alert-outline-icon :size="19" />
        <span class="block ml-5">Save</span>
      </button>
      <button @click="reset" class="flex items-center px-4 py-2 w-full hover:text-primary">
        <autorenew-icon :size="19" />
        <span class="block ml-5">Reset</span>
      </button>
    </div>
  </div>
</template>

<script>
import BackButton from '@/components/settings/BackButton';
import Tag from '@/models/Tag';
import ContentSaveAlertOutlineIcon from 'vue-material-design-icons/ContentSaveAlertOutline';
import AutorenewIcon from 'vue-material-design-icons/Autorenew';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical';
import CheckIcon from 'vue-material-design-icons/Check';
import ChangeLogger from '@/sync/ChangeLogger';
import { TAG_COLORS, FALLBACK_TAG_COLOR } from '@/constants';

export default {
  components: {
    BackButton,
    ContentSaveAlertOutlineIcon,
    AutorenewIcon,
    DotsVerticalIcon,
    CheckIcon
  },
  data() {
    return {
      tags: [],
      selectedTagId: null,
      openColorSelectionDropdownMenu: false,
      initialColors: {},
      colorList: TAG_COLORS,
      defaultColor: FALLBACK_TAG_COLOR // will be used if tag does not have any color
    };
  },
  methods: {
    onToggleTagColorSelectionMenu(tag) {
      if (this.openColorSelectionDropdownMenu) {
        this.selectedTagId = null;
        this.openColorSelectionDropdownMenu = false;
      } else {
        this.selectedTagId = tag.id;
        this.openColorSelectionDropdownMenu = true;
      }
    },
    async onTagColorSelected(id, hexValue) {
      this.tags = this.tags.map(tag => {
        if (tag.id == id) tag.color = hexValue;
        return tag;
      });
    },
    tagStyles(tag) {
      const obj = {};
      // default
      obj['background-color'] = this.defaultColor;

      if (tag.color) {
        obj['background-color'] = tag.color;
      }

      return obj;
    },
    async save() {
      for (let index = 0; index < this.tags.length; index++) {
        const tag = this.tags[index];

        await tag.$save();
        await ChangeLogger.tagPropertyValueChanged(tag.id, 'color', tag.color);
      }
    },
    reset() {
      this.tags = this.tags.map(tag => {
        tag.color = this.initialColors[tag.id];
        return tag;
      });
    }
  },
  mounted() {
    this.tags = Tag.all();

    this.tags.forEach(tag => (this.initialColors[tag.id] = tag.color));

    document.body.addEventListener('click', e => {
      if (e.target.matches('.dropdown-toggle-btn') || e.target.matches('.dropdown-toggle-btn *')) return;
      if (e.target.matches('.dropdown *')) return;

      this.openColorSelectionDropdownMenu = false;
      this.selectedTagId = null;
    });
  }
};
</script>

<style scoped>
.tag {
  color: #000;
  border-radius: 5px;
}

.dropdown {
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.dark .dropdown {
  box-shadow: rgb(0 0 0 / 20%) 0px 7px 29px 0px;
}

.actions {
  height: 122px;
}

.list {
  height: calc(100% - 165px);
  overflow: auto;
  margin-top: 35px;
  margin-bottom: 20px;
}

.actions button:hover {
  background: #f2f2f2;
}

.dark .actions button:hover {
  background: #303031;
}
</style>
