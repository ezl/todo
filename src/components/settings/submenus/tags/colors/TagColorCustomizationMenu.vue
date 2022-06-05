<template>
  <div>
    <BackButton @click="$emit('close')" class="m-3">Tag color customization</BackButton>
    <div class="mt-8 overflow-auto list px-4">
      <div v-for="tag in tags" :key="tag.id" class="flex items-center justify-between mt-2">
        <span :style="tagStyles(tag)" class="px-3 py-1 tag">{{ tag.name }}</span>
        <div class="flex relative">
          <dots-vertical-icon :size="20" @click="showTagColorPicker(tag)" class="tag-color-picker-toggle-btn cursor-pointer text-secondary" />
        </div>
      </div>
    </div>
    <TagColorPicker
      v-if="openTagColorPicker"
      :tag="selectedTag"
      :colors="colorList"
      @pick="onTagColorSelected"
      class="tag-color-picker absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
      selectedTag: null,
      openTagColorPicker: false,
      colorList: TAG_COLORS
    };
  },
  computed: {
    tags() {
      return Tag.getOrderedTags();
    }
  },
  methods: {
    showTagColorPicker(tag) {
      if (this.openTagColorPicker && this.selectedTag.id == tag.id) {
        this.closeTagColorPicker();
        return;
      }

      this.selectedTag = tag;
      this.openTagColorPicker = true;
    },
    closeTagColorPicker() {
      this.selectedTag = null;
      this.openTagColorPicker = false;
    },
    async onTagColorSelected({ tag, selectedColor }) {
      tag.color = selectedColor;
      await tag.$save();
      await ChangeLogger.tagPropertyValueChanged(tag.id, 'color', tag.color);

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
    }
  },
  mounted() {
    document.body.addEventListener('click', e => {
      if (e.target.matches('.tag-color-picker-toggle-btn') || e.target.matches('.tag-color-picker-toggle-btn *')) return;
      if (e.target.matches('.tag-color-picker *')) return;

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

.list {
  height: calc(100% - 78px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
