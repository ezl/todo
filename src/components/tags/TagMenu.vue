<template>
  <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" class="tag-settings-btn-wrapper">
    <button :class="{'!visible': hoveringOver}" class="tag-settings-btn p-1 rounded-md">
      <SettingsSmallIcon />
    </button>
  </div>
</template>

<script>
import SettingsSmallIcon from '@/assets/images/icons/settings-small.svg';

export default {
  components: {
    SettingsSmallIcon
  },
  data() {
    return {
      hoveringOver: false
    };
  },
  methods: {
    onMouseEnter() {
      this.hoveringOver = true;

      Array.from(document.querySelectorAll('.tag')).forEach(element => {
        element.classList.add('hover-state');
      });
    },
    onMouseLeave() {
      this.hoveringOver = false;

      Array.from(document.querySelectorAll('.tag')).forEach(element => {
        element.classList.remove('hover-state');
      });
    }
  }
};
</script>

<style scoped>
.tag-settings-btn {
  color: #a4a4a7;
  transition: none;
  visibility: hidden;
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
