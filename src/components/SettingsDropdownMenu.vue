<template>
  <div ref="container" class="md:relative settings-dropdown-menu">
    <button
      @click="toggleMenu"
      class="z-30 p-2 rounded-lg hover:bg-bright-gray dark:hover:bg-dark-charcoal text-black dark:text-gray-400 absolute top-0 right-0 md:relative"
    >
      <SettingsIcon />
    </button>
    <div
      v-if="open"
      class="dropdown-body z-20 p-5 inset-x-0 inset-y-0 absolute md:w-80 bg-lotion dark:bg-dark-gunmetal p-3 shadow-[1.95px_1.95px_3.6px_rgba(0,0,0,0.11)] rounded-lg top-0 -left-80 text-sm"
    >
      <div class="mt-8">
        <label>Email Address:</label>
        <div class="flex items-center mt-2">
          <span class="text-gray-400">someone@somewhere.com</span>
          <pencil-outline-icon class="ml-2 text-gray-asparagus" />
        </div>
      </div>
      <div class="mt-6 flex justify-between items-center cursor-pointer">
        <span>View hotkeys</span>
        <chevron-right-icon />
      </div>
      <div class="mt-6">
        <label for="new-item-placement">Default new item placement:</label>
        <select
          @change="onSettingsChanged"
          v-model="currentSettings.new_item_placement"
          id="new-item-placement"
          class="py-2 px-3 rounded-md bg-bright-gray dark:bg-dark-charcoal w-full mt-2"
        >
          <option value="top">Top of list</option>
          <option value="bottom">Bottom of list</option>
        </select>
      </div>
      <div class="mt-6">
        <label for="theme">Appearance:</label>
        <select
          @change="onSettingsChanged"
          v-model="currentSettings.theme"
          id="theme"
          class="py-2 px-3 rounded-md bg-bright-gray dark:bg-dark-charcoal w-full mt-2"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="mt-6">
        <label for="completed-preference">Completed Preference:</label>
        <select
          @change="onSettingsChanged"
          v-model="currentSettings.completed_preference"
          id="completed-preference"
          class="py-2 px-3 rounded-md bg-bright-gray dark:bg-dark-charcoal w-full mt-2"
        >
          <option value="strikethrough_until_refresh">Strikethrough until refresh</option>
          <option value="clear_immediately">Clear Immediately</option>
        </select>
      </div>
      <div class="mt-6">
        <label for="completed-preference">Track time spent:</label>
        <button class="p-3 rounded-lg bg-gray-asparagus mt-2 w-full text-white">Sync with Pomodoro Party</button>
      </div>
      <div class="mt-10 flex justify-center">
        <span class="cursor-pointer">Logout</span>
      </div>
    </div>
  </div>
</template>

<script>
import PencilOutlineIcon from 'vue-material-design-icons/PencilOutline';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight';
import Setting from '@/models/Setting';
import SettingsIcon from '@/assets/images/icons/settings.svg';

export default {
  components: {
    PencilOutlineIcon,
    ChevronRightIcon,
    SettingsIcon
  },
  data() {
    return {
      open: false,
      currentSettings: {}
    };
  },
  methods: {
    toggleMenu() {
      this.open = !this.open;
    },
    async onSettingsChanged() {
      await Setting.update({
        where: this.settings.id,
        data: {
          ...this.currentSettings
        }
      });

      this.currentSettings = { ...this.settings };
      this.updateTheme();
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

      this.open = false;
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
  left: -274px;
}

@media only screen and (max-width: 480px) {
  .settings-dropdown-menu .dropdown-body {
    left: 0px;
  }
}
</style>
