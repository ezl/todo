<template>
  <div ref="container" class="md:relative settings-dropdown-menu">
    <button
      :class="{ invisible: !showDropdownToggleButton }"
      @click="toggleMenu"
      class="z-30 p-2 rounded-lg hover:bg-bright-gray dark:hover:bg-dark-charcoal text-black dark:text-gray-400 absolute top-0 right-0 md:relative"
    >
      <dots-horizontal-icon v-show="!open" />
      <close-icon v-show="open" />
    </button>
    <div
      v-if="open"
      class="dropdown-body z-20  inset-x-0 inset-y-0 md:bottom-auto absolute md:w-80 bg-lotion dark:bg-dark-gunmetal shadow-[1.95px_1.95px_3.6px_rgba(0,0,0,0.11)] rounded-lg top-0 -left-80 text-sm"
    >
      <div :class="{ 'show-sub-menu': currentSubMenuId }" class="menu-container">
        <GeneralSettingsTab :settings="currentSettings" @settings-updated="onSettingsChanged" :tab-ids="subMenuIds" :switch-tab="showSubMenu" />
        <div class="sub-menu-container">
          <TagSettingsTab :ref="subMenuIds.tagSettings" @go-back="showMainMenu(subMenuIds.tagSettings)" />
          <HotkeysSettingsTab :ref="subMenuIds.hotkeys" @go-back="showMainMenu(subMenuIds.hotkeys)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Setting from '@/models/Setting';
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal';
import CloseIcon from 'vue-material-design-icons/Close';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import TagSettingsTab from '@/components/settings/tabs/TagSettingsTab';
import HotkeysSettingsTab from '@/components/settings/tabs/HotkeysSettingsTab';
import GeneralSettingsTab from '@/components/settings/tabs/GeneralSettingsTab';

export default {
  components: {
    DotsHorizontalIcon,
    TagSettingsTab,
    HotkeysSettingsTab,
    GeneralSettingsTab,
    CloseIcon
  },
  data() {
    return {
      open: false,
      currentSettings: {},
      subMenuIds: {
        tagSettings: 'tag-settings',
        hotkeys: 'hotkeys'
      },
      currentSubMenuId: null,
      showDropdownToggleButton: true
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
    async onSettingsChanged(newSettings) {
      await Setting.update({
        where: this.settings.id,
        data: {
          ...newSettings
        }
      });

      this.currentSettings = { ...this.settings };
      this.updateTheme();
    },
    showSubMenu(id) {
      console.log(id);
      this.currentSubMenuId = id;
      this.$refs[id].$el.classList.remove('hidden');
      this.showDropdownToggleButton = false;
    },
    showMainMenu(currentSubMenuId) {
      this.currentSubMenuId = null;
      setTimeout(() => {
        this.$refs[currentSubMenuId].$el.classList.add('hidden');
        this.showDropdownToggleButton = true;
      }, 400);
    },
    updateTheme() {
      if (this.settings.theme === 'dark') {
        document.body.classList.remove('bg-white');
        document.body.classList.add('dark');
        document.body.classList.add('bg-eerie-black');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.remove('bg-eerie-black');
        document.body.classList.add('bg-white');
      }
    }
  },
  computed: {
    settings() {
      return Setting.query().first();
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

      this.open = false;
      this.showDropdownToggleButton = true;
      this.currentSubMenuId = null;
    });

    this.currentSettings = { ...this.settings };
    this.updateTheme();

    // Using setTimeout to avoid applying transitions when we switch to the user's preferred theme on page load
    // We only need to apply transition when the user change theme.
    setTimeout(() => document.body.classList.add('apply-transition'), 1000);
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

.menu-container {
  display: flex;
  position: relative;
  transition: 0.4s transform ease-in-out !important;
}

.menu-container.show-sub-menu {
  transform: translateX(calc(-100%));
}

.menu {
  padding: 15px;
  height: 100%;
}

.main-menu {
  width: 100%;
}

.sub-menu-container {
  position: absolute;
  left: calc(100%);
  width: 100%;
  height: 100%;
}

@media only screen and (max-width: 480px) {
  .settings-dropdown-menu .dropdown-body {
    left: 0px;
  }

  .menu {
    padding: 15px 7px;
  }
}
</style>