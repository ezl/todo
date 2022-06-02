<template>
  <div>
    <BackButton @click="$emit('close')" class="m-3">Tag color customization</BackButton>
    <div class="list px-4">
      <div v-for="tag in tags" :key="tag.id" class="flex items-center justify-between mt-2">
        <span :style="tagStyles(tag)" class="px-3 py-1 tag">{{ tag.name }}</span>
        <div class="flex relative">
          <dots-vertical-icon :size="20" @click="showTagColorPicker(tag)" class="dropdown-toggle-btn cursor-pointer text-gray-500" />
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
    <TagColorPicker
      v-if="openTagColorPicker"
      :tag="selectedTag"
      :colors="colorList"
      @pick="onTagColorSelected"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    />
  </div>
</template>

<script>
import BackButton from '@/components/settings/BackButton';
import Tag from '@/models/Tag';
import ContentSaveAlertOutlineIcon from 'vue-material-design-icons/ContentSaveAlertOutline';
import AutorenewIcon from 'vue-material-design-icons/Autorenew';
import DotsVerticalIcon from 'vue-material-design-icons/DotsVertical';
import ChangeLogger from '@/sync/ChangeLogger';
import { TAG_COLORS, FALLBACK_TAG_COLOR } from '@/constants';
import TagColorPicker from '@/components/settings/submenus/tags/colors/TagColorPicker';

export default {
  components: {
    BackButton,
    ContentSaveAlertOutlineIcon,
    AutorenewIcon,
    DotsVerticalIcon,
    TagColorPicker
  },
  data() {
    return {
      tags: [],
      selectedTag: null,
      openTagColorPicker: false,
      initialColors: {},
      colorList: TAG_COLORS
    };
  },
  methods: {
    showTagColorPicker(tag) {
      if (this.openTagColorPicker && this.selectedTag.id == tag.id) {
        this.closeTagColorPicker();
        return
      }

      this.selectedTag = tag;
      this.openTagColorPicker = true;
    },
    closeTagColorPicker() {
      this.selectedTag = null;
      this.openTagColorPicker = false;
    },
    async onTagColorSelected({ tagId, selectedColor }) {
      this.tags = this.tags.map(tag => {
        if (tag.id == tagId) tag.color = selectedColor;
        return tag;
      });

      this.closeTagColorPicker();
    },
    tagStyles(tag) {
      const obj = {};
      // default
      obj['background-color'] = FALLBACK_TAG_COLOR;

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

      this.openTagColorPicker = false;
      this.selectedTag = null;
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
