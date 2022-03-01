<template>
  <div class="flex items-center relative">
    <div
      @mouseenter="hoveringOverTagSettingsBtn = true"
      @mouseleave="hoveringOverTagSettingsBtn = false"
      class="absolute -left-12 hover:opacity-100 opacity-60 tag-settings-btn-wrapper"
    >
      <button :class="dynamicTagSettingsBtnClasses" class="z-20 tag-settings-btn p-1 rounded-md">
        <SettingsSmallIcon />
      </button>
    </div>
    <button class="text-primary z-20">
      <SearchIcon />
    </button>
    <div @mouseenter="hoveringOverTags = true" @mouseleave="hoveringOverTags = false" class="flex flex-wrap ml-4">
      <Tag v-for="tag in tags" :key="tag.id" :tag="tag" :class="dynamicTagsWrapperClasses" />
    </div>
  </div>
</template>

<script>
import Tag from '@/components/tags/Tag';
import TagModel from '@/models/Tag';
import SearchIcon from '@/assets/images/icons/search.svg';
import SettingsSmallIcon from '@/assets/images/icons/settings-small.svg';

export default {
  components: {
    Tag,
    SearchIcon,
    SettingsSmallIcon
  },
  data() {
    return {
      hoveringOverTags: false,
      hoveringOverTagSettingsBtn: false
    };
  },
  computed: {
    tags() {
      return TagModel.query()
        .has('items')
        .get();
    },
    dynamicTagSettingsBtnClasses() {
      const classList = [];

      if (this.hoveringOverTags || this.hoveringOverTagSettingsBtn) classList.push('!visible');

      if (!this.hoveringOverTags) classList.push('invisible');

      return classList;
    },
    dynamicTagsWrapperClasses() {
      const classList = [];

      if (this.hoveringOverTagSettingsBtn) classList.push('hover-state');

      return classList;
    }
  }
};
</script>

<style scoped>
.tag-settings-btn {
  color: #a4a4a7;
  transition: none;
}

.tag-settings-btn-wrapper:hover .tag-settings-btn {
  @apply text-primary;
}

.tag-settings-btn:hover {
  background: #f2f2f2;
}

.dark .tag-settings-btn:hover {
  background: #24222b;
}
</style>
