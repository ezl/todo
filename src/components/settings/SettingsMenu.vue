<template>
  <div ref="container" class="md:relative settings-dropdown-menu">
    <button
      :class="{ invisible: !showDropdownToggleButton }"
      @click="toggleMenu"
      class="z-30 p-2 rounded-lg hover:bg-bright-gray dark:hover:bg-dark-charcoal text-black dark:text-secondary absolute top-0 right-0 md:relative"
    >
      <dots-horizontal-icon v-show="!open" />
      <close-icon v-show="open" />
    </button>
    <div
      v-if="open"
      class="dropdown-body z-20  inset-x-0 inset-y-0 md:bottom-auto absolute md:w-80 bg-lotion dark:bg-dark-gunmetal shadow-[1.95px_1.95px_3.6px_rgba(0,0,0,0.11)] rounded-lg top-0 -left-80 text-sm"
    >
      <NestedMenu :active-menu-id="activeMenuId">
        <GeneralSettingsMenu
          :data-menu-id="menuIds.generalSettings"
          data-main-menu
          :menu-ids="menuIds"
          :switch-menu="switchMenu"
        />

        <HotkeysSettingsMenu :data-menu-id="menuIds.hotkeys" @close="showMainMenu" />
        <MainTagSettingsMenu :data-menu-id="menuIds.tagSettings" @close="showMainMenu"  />
      </NestedMenu>
    </div>
  </div>
</template>

<script>
import Setting from '@/models/Setting';
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal';
import CloseIcon from 'vue-material-design-icons/Close';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import MainTagSettingsMenu from '@/components/settings/submenus/tags/MainTagSettingsMenu';
import HotkeysSettingsMenu from '@/components/settings/submenus/HotkeysSettingsMenu';
import GeneralSettingsMenu from '@/components/settings/GeneralSettingsMenu';
import NestedMenu from '@/components/settings/NestedMenu';

export default {
  components: {
    DotsHorizontalIcon,
    MainTagSettingsMenu,
    HotkeysSettingsMenu,
    GeneralSettingsMenu,
    CloseIcon,
    NestedMenu
  },
  data() {
    return {
      open: false,
      menuIds: {
        generalSettings: 'general-settings',
        tagSettings: 'tag-settings',
        hotkeys: 'hotkeys'
      },
      activeMenuId: '',
      currentSubMenuId: null,
      showDropdownToggleButton: true
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
      // Reset menu whenever the popup is closed/opened
      this.activeMenuId = this.menuIds.generalSettings;
    },
    switchMenu(id) {
      this.activeMenuId = id;
      if (id != this.menuIds.generalSettings) this.showDropdownToggleButton = false;
    },
    showMainMenu() {
      this.activeMenuId = this.menuIds.generalSettings;
      setTimeout(() => {
        this.showDropdownToggleButton = true;
      }, 400);
    }
  },
  async mounted() {
    // close the menu when user clicks outside
    document.body.addEventListener('click', e => {
      // Except if:
      // The clicked element is a descendant of the menu
      if (this.$refs.container.contains(e.target)) return;
      // What was clicked is the menu itself
      if (this.$refs.container === e.target) return;
      // Make sure that this element actually exists
      if (!document.body.contains(e.target)) return;
      // We clicked a notification 
      if(e.target.matches('.vue-notification-group *')) return

      this.open = false;
      this.showDropdownToggleButton = true;
      this.currentSubMenuId = null;
    });

    // Using setTimeout to avoid applying transitions when we switch to the user's preferred theme on page load
    // We only need to apply transition when the user change theme.
    setTimeout(() => document.body.classList.add('apply-transition'), 1000);
  },
  watch: {
    open: {
      handler: function(newVal) {
        this.$emit('toggled', newVal)
        
        // Temporarily prevent body from scrolling while settings menu is opened
        if (window.screen.width <= 480) {
          if (this.open) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = 'auto';
          }
        }
      }
    }
  },
  watch: {
    '$route' (to, from) {
      // Close when the page changes 
      this.open = false
    }
  }
};
</script>

<style>
.settings-dropdown-menu .dropdown-body {
  left: -280px;
  overflow: hidden;
  min-height: 500px;
}

input[type='radio']:not(.hidden) {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  font: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  border-radius: 50%;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid #ebebeb;
}

input[type='radio']::before {
  content: '';
  border-radius: 50%;
  transform: scale(0);
  width: 0.55em;
  height: 0.55em;
  @apply bg-primary;
}

input[type='radio']:checked::before {
  transform: scale(1);
}

@media only screen and (max-width: 480px) {
  .settings-dropdown-menu .dropdown-body {
    left: 0px;
  }
}
</style>
