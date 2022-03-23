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
      class="dropdown-body z-20 p-5 inset-x-0 inset-y-0 md:bottom-auto absolute md:w-80 bg-lotion dark:bg-dark-gunmetal p-3 shadow-[1.95px_1.95px_3.6px_rgba(0,0,0,0.11)] rounded-lg top-0 -left-80 text-sm"
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
      <div class="exporting mb-4 mt-8 flex justify-between items-center px-10">
        <label class="cursor-pointer hover:text-primary">
          Import data
          <input type="file" @change="importData" accept=".json" class="hidden" />
        </label>
        <span @click="exportData" class="cursor-pointer hover:text-primary">Export data</span>
      </div>
    </div>
  </div>
</template>

<script>
import PencilOutlineIcon from 'vue-material-design-icons/PencilOutline';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight';
import Setting from '@/models/Setting';
import SettingsIcon from '@/assets/images/icons/settings.svg';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';

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
    },
    async exportData() {
      const items = await LocalStorageHelper.getValue({ items: [] });
      const tags = await LocalStorageHelper.getValue({ tags: [] });
      const itemTagRelationships = await LocalStorageHelper.getValue({ itemTagRelationships: [] });

      const data = JSON.stringify({
        version: 1,
        data: {
          items,
          tags,
          itemTagRelationships,
        }
      });

      // Initiate download
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data));
      element.setAttribute('download', 'Badtodo - export ' + new Date().getTime() + '.json');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    importData(e) {
      if (e.target.files.length === 0) return;

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async event => {
        let json;

        try {
          json = JSON.parse(event.target.result);
        } catch (error) {
          alert('Could not import this file');
          console.error(error);
        }
        
        if (json === undefined || json.data === undefined) return;

        const data = json.data;

        if (data.items) await LocalStorageHelper.setValue({ items: data.items });
        if (data.tags) await LocalStorageHelper.setValue({ tags: data.tags });
        if (data.itemTagRelationships) await LocalStorageHelper.setValue({ itemTagRelationships: data.itemTagRelationships });

        LocalStorageHelper.restore();

        this.open = false;
      };

      reader.readAsText(file);
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

.exporting label,
.exporting span {
  color: #babbbb;
}

@media only screen and (max-width: 480px) {
  .settings-dropdown-menu .dropdown-body {
    left: 0px;
  }
}
</style>
