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
        <div class="menu main-menu">
          <h4 class="text-center">Settings</h4>
          <Syncing class="mt-8" />
          <div @click="showSubMenu(subMenuIds.hotkeys)" class="flex justify-between items-center mt-4 cursor-pointer">
            <span>See hotkeys (press ? to toggle)</span>
            <chevronRightIcon class="text-primary" />
          </div>
          <div @click="showSubMenu(subMenuIds.tagSettings)" class="flex justify-between items-center mt-4 cursor-pointer">
            <span>Tag settings</span>
            <chevronRightIcon class="text-primary" />
          </div>
          <div class="mt-4">
            <span
              >Place new tasks on: <span class="text-primary">{{ currentSettings.new_item_placement }}</span></span
            >
            <div class="flex justify-around mt-2">
              <label
                :class="{ 'border-2 !border-primary !opacity-100': currentSettings.new_item_placement == 'top' }"
                class="opacity-20 p-1 border-2 border-transparent rounded-md"
              >
                <div class="tablet-icon dark:bg-white bg-gray-200">
                  <span class="bg-primary"></span>
                  <span class="bg-gray-400"></span>
                  <span class="bg-gray-400"></span>
                  <span class="bg-gray-400"></span>
                </div>
                <input @change="onSettingsChanged" type="radio" value="top" v-model="currentSettings.new_item_placement" class="hidden" />
              </label>
              <label
                :class="{ 'border-2 !border-primary !opacity-100': currentSettings.new_item_placement == 'bottom' }"
                class="opacity-20 p-1 rounded-md border-2 border-transparent"
              >
                <div class="tablet-icon dark:bg-white bg-gray-200">
                  <span class="bg-gray-400"></span>
                  <span class="bg-gray-400"></span>
                  <span class="bg-gray-400"></span>
                  <span class="bg-primary"></span>
                </div>
                <input @change="onSettingsChanged" type="radio" value="bottom" v-model="currentSettings.new_item_placement" class="hidden" />
              </label>
            </div>
          </div>
          <div class="mt-6 flex flex-col">
            <span>After completing an item:</span>
            <label class="flex items-center pl-1">
              <input @change="onSettingsChanged" type="radio" value="strikethrough_until_refresh" v-model="currentSettings.completed_preference" />
              <span class="ml-2">Strikethrough until refresh</span>
            </label>
            <label class="flex items-center pl-1">
              <input @change="onSettingsChanged" type="radio" value="clear_immediately" v-model="currentSettings.completed_preference" />
              <span class="ml-2">Remove it immediately</span>
            </label>
          </div>
          <div class="mt-4">
            <span
              >Appearance: <span class="text-primary">{{ currentSettings.theme }} mode</span></span
            >
            <div class="flex justify-around mt-2">
              <label
                :class="{ 'border-2 !border-primary !opacity-100': currentSettings.theme == 'light' }"
                class="opacity-20 p-1 border-2 border-transparent rounded-md"
              >
                <div class="tablet-icon dark:bg-white">
                  <span class="bg-dark-jungle-green"></span>
                  <span class="bg-dark-jungle-green"></span>
                  <span class="bg-dark-jungle-green"></span>
                  <span class="bg-dark-jungle-green"></span>
                </div>
                <input @change="onSettingsChanged" type="radio" value="light" v-model="currentSettings.theme" class="hidden" />
              </label>
              <label
                :class="{ 'border-2 !border-primary !opacity-100': currentSettings.theme == 'dark' }"
                class="opacity-10 p-1 border-2 border-transparent rounded-md"
              >
                <div class="tablet-icon bg-dark-jungle-green">
                  <span class="bg-white"></span>
                  <span class="bg-white"></span>
                  <span class="bg-white"></span>
                  <span class="bg-white"></span>
                </div>
                <input @change="onSettingsChanged" type="radio" value="dark" v-model="currentSettings.theme" class="hidden" />
              </label>
            </div>
          </div>
          <div class="exporting mt-12 flex justify-between items-center px-10">
            <label class="cursor-pointer hover:text-primary">
              Import data
              <input type="file" @change="importData" accept=".json" class="hidden" />
            </label>
            <span @click="exportData" class="cursor-pointer hover:text-primary">Export data</span>
          </div>
        </div>

        <div class="sub-menu-container">
          <div :ref="subMenuIds.tagSettings" class="menu hidden">
            <div @click="showMainMenu(subMenuIds.tagSettings)" class="flex items-center cursor-pointer">
              <ChevronLeftIcon class="w-10 h-10 text-primary" />
              <h4 class="">Tag settings</h4>
            </div>
            <div class="h-full flex justify-center items-center">
              <h1>WIP</h1>
            </div>
          </div>
          <div :ref="subMenuIds.hotkeys" class="menu hidden">
            <div @click="showMainMenu(subMenuIds.hotkeys)" class="flex items-center cursor-pointer">
              <ChevronLeftIcon class="w-10 h-10 text-primary" />
              <h4 class="">Hotkeys</h4>
            </div>
            <div class="h-full flex justify-center items-center">
              <h1>WIP</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CloseCircleOutlineIcon from 'vue-material-design-icons/CloseCircleOutline';
import ChevronRightIcon from '@/assets/images/icons/chevron-right.svg';
import ChevronLeftIcon from '@/assets/images/icons/chevron-left.svg';
import Setting from '@/models/Setting';
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal';
import CloseIcon from 'vue-material-design-icons/Close';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import Syncing from '@/components/settings/Syncing';

export default {
  components: {
    CloseCircleOutlineIcon,
    ChevronRightIcon,
    DotsHorizontalIcon,
    ChevronLeftIcon,
    CloseIcon,
    Syncing
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
          itemTagRelationships
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
    },
    showSubMenu(id) {
      console.log(id);
      this.currentSubMenuId = id;
      this.$refs[id].classList.remove('hidden');
      this.showDropdownToggleButton = false;
    },
    showMainMenu(subMenuId) {
      this.currentSubMenuId = null;
      setTimeout(() => {
        this.$refs[subMenuId].classList.add('hidden');
        this.showDropdownToggleButton = true;
      }, 400);
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

.exporting label,
.exporting span {
  color: #babbbb;
}

.tablet-icon {
  width: 43px;
  height: 60px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  cursor: pointer;
  padding: 10px 9px;
  border-radius: 14%;
}

.tablet-icon span {
  height: 3px;
  border-radius: 18%;
  display: block;
  width: 100%;
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
