<template>
  <div ref="container" class="relative settings-dropdown-menu">
    <button @click="toggleMenu" class="p-2 rounded-lg bg-bright-gray dark:bg-dark-charcoal text-black dark:text-gray-400 z-20 relative">
      <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          opacity="0.6"
          d="M16.7879 1.86434L19.8943 5.97933C20.3364 6.56486 21.0097 6.92744 21.734 6.99588L27.0346 7.49676C28.5789 7.64269 29.3817 9.13186 28.8115 10.3313L26.6173 14.9472C26.2998 15.6152 26.2998 16.3848 26.6173 17.0528L28.8115 21.6687C29.3817 22.8681 28.579 24.3573 27.0346 24.5032L21.734 25.0041C21.0097 25.0726 20.3364 25.4351 19.8943 26.0207L16.7879 30.1357C15.9179 31.2881 14.0821 31.2881 13.2121 30.1357L10.1057 26.0207C9.66364 25.4351 8.99027 25.0726 8.26602 25.0041L2.96536 24.5032C1.42105 24.3573 0.618289 22.8681 1.18846 21.6687L3.38265 17.0528C3.70019 16.3848 3.70019 15.6152 3.38265 14.9472L1.18846 10.3313C0.618289 9.13185 1.42105 7.64269 2.96537 7.49676L8.26602 6.99588C8.99027 6.92744 9.66364 6.56486 10.1057 5.97933L13.2121 1.86433C14.0821 0.711888 15.9179 0.711888 16.7879 1.86434Z"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          opacity="0.6"
          d="M19.456 16.0003C19.456 18.3725 17.4829 20.3337 15.0014 20.3337C12.5199 20.3337 10.5469 18.3725 10.5469 16.0003C10.5469 13.6282 12.5199 11.667 15.0014 11.667C17.4829 11.667 19.456 13.6282 19.456 16.0003Z"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </button>
    <div
      v-if="open"
      class="dropdown-body p-5 absolute w-80 bg-lotion dark:bg-dark-gunmetal p-3 shadow-[1.95px_1.95px_3.6px_rgba(0,0,0,0.11)] rounded-lg top-0 -left-80 z-10 text-sm"
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

export default {
  components: {
    PencilOutlineIcon,
    ChevronRightIcon
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

      this.currentSettings = {...this.settings};
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

    await Setting.fetch();
    this.currentSettings = {...this.settings}

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
</style>
