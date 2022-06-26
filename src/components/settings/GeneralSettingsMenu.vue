<template>
  <div class="menu main-menu">
    <h4 class="text-center">Settings</h4>
    <Syncing class="mt-8" />
    <router-link :to="{ name: 'tasks.completed' }" class="flex justify-between items-center mt-4 cursor-pointer">
      <span>See completed tasks</span>
      <chevronRightIcon class="text-primary" />
    </router-link>
    <div @click="switchMenu(menuIds.hotkeys)" class="flex justify-between items-center mt-4 cursor-pointer">
      <span>See hotkeys (press ? to toggle)</span>
      <chevronRightIcon class="text-primary" />
    </div>
    <div @click="switchMenu(menuIds.tagSettings)" class="flex justify-between items-center mt-4 cursor-pointer">
      <span>Tag settings</span>
      <chevronRightIcon class="text-primary" />
    </div>
    <div class="mt-4">
      <span
        >Place new tasks on: <span class="text-primary">{{ settings.new_item_placement }}</span></span
      >
      <div class="flex justify-around mt-2">
        <label
          :class="{ 'border-2 !border-primary !opacity-100': settings.new_item_placement == 'top' }"
          class="opacity-20 p-1 border-2 border-transparent rounded-md"
        >
          <div class="tablet-icon dark:bg-white bg-gray-200">
            <span class="bg-primary"></span>
            <span class="bg-secondary"></span>
            <span class="bg-secondary"></span>
            <span class="bg-secondary"></span>
          </div>
          <input @change="updateSettings" type="radio" value="top" v-model="settingValues.new_item_placement" class="hidden" />
        </label>
        <label
          :class="{ 'border-2 !border-primary !opacity-100': settings.new_item_placement == 'bottom' }"
          class="opacity-20 p-1 rounded-md border-2 border-transparent"
        >
          <div class="tablet-icon dark:bg-white bg-gray-200">
            <span class="bg-secondary"></span>
            <span class="bg-secondary"></span>
            <span class="bg-secondary"></span>
            <span class="bg-primary"></span>
          </div>
          <input @change="updateSettings" type="radio" value="bottom" v-model="settingValues.new_item_placement" class="hidden" />
        </label>
      </div>
    </div>
    <div class="mt-6 flex flex-col">
      <span>After completing an item:</span>
      <label class="flex items-center pl-1">
        <input @change="updateSettings" type="radio" value="strikethrough_until_refresh" v-model="settingValues.completed_preference" />
        <span class="ml-2">Strikethrough until refresh</span>
      </label>
      <label class="flex items-center pl-1">
        <input @change="updateSettings" type="radio" value="clear_immediately" v-model="settingValues.completed_preference" />
        <span class="ml-2">Remove it immediately</span>
      </label>
    </div>
    <div class="mt-4">
      <span
        >Appearance: <span class="text-primary">{{ settings.theme }} mode</span></span
      >
      <div class="flex justify-around mt-2">
        <label :class="{ 'border-2 !border-primary !opacity-100': settings.theme == 'light' }" class="opacity-20 p-1 border-2 border-transparent rounded-md">
          <div class="tablet-icon dark:bg-white">
            <span class="bg-dark-jungle-green"></span>
            <span class="bg-dark-jungle-green"></span>
            <span class="bg-dark-jungle-green"></span>
            <span class="bg-dark-jungle-green"></span>
          </div>
          <input @change="updateSettings" type="radio" value="light" v-model="settingValues.theme" class="hidden" />
        </label>
        <label :class="{ 'border-2 !border-primary !opacity-100': settings.theme == 'dark' }" class="opacity-10 p-1 border-2 border-transparent rounded-md">
          <div class="tablet-icon bg-dark-jungle-green">
            <span class="bg-white"></span>
            <span class="bg-white"></span>
            <span class="bg-white"></span>
            <span class="bg-white"></span>
          </div>
          <input @change="updateSettings" type="radio" value="dark" v-model="settingValues.theme" class="hidden" />
        </label>
      </div>
    </div>
    <div class="exporting mt-12 flex justify-between items-center px-10 text-secondary">
      <label class="cursor-pointer hover:text-primary">
        Import data
        <input type="file" @change="importData" accept=".json" class="hidden" />
      </label>
      <span @click="exportData" class="cursor-pointer hover:text-primary">Export data</span>
    </div>
  </div>
</template>

<script>
import ChevronRightIcon from '@/assets/images/icons/chevron-right.svg';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import Syncing from '@/components/settings/Syncing';
import HotkeysSettingsMenu from '@/components/settings/submenus/HotkeysSettingsMenu';
import settings from '@/mixins/settings';

export default {
  props: {
    menuIds: {
      type: Object,
      required: true
    },
    switchMenu: {
      type: Function,
      required: false
    }
  },
  components: {
    ChevronRightIcon,
    Syncing,
    HotkeysSettingsMenu
  },
  methods: {
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
      };

      reader.readAsText(file);
    },
  },
  mixins: [settings]
};
</script>

<style>
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
</style>
