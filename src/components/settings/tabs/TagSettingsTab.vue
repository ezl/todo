<template>
  <div class="menu hidden">
    <div @click="$emit('go-back')" class="flex items-center cursor-pointer">
      <ChevronLeftIcon class="w-10 h-10 text-primary" />
      <h4 class="">Back to main settings</h4>
    </div>
    <div class="h-full pl-4">
      <div class="flex justify-between items-center mt-8 cursor-pointer">
        <span>Customize tag colors</span>
        <chevronRightIcon class="text-primary" />
      </div>
      <div class="mt-6 flex flex-col">
        <span>Display tags by:</span>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" value="alphabetical_order" v-model="currentSettings.sort_tags_by" />
          <span class="ml-2">Alphabetical order (A-Z)</span>
        </label>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" value="usage_frequency" v-model="currentSettings.sort_tags_by" />
          <span class="ml-2">Most frequently used first</span>
        </label>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" value="oldest" v-model="currentSettings.sort_tags_by" />
          <span class="ml-2">Oldest tags first</span>
        </label>
      </div>
      <div class="mt-6 flex flex-col">
        <span>If there are no tasks with a tag:</span>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.hide_tags_without_items" />
          <span class="ml-2">Hide these tags</span>
        </label>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.hide_tags_without_items" />
          <span class="ml-2">Display these tags anyways</span>
        </label>
      </div>
      <div class="mt-6 flex flex-col">
        <span>If multiple tags are selected, show items that match:</span>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.show_only_items_matching_all_selected_tags" />
          <span class="ml-2">ALL selected tags (“and”)</span>
        </label>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.show_only_items_matching_all_selected_tags" />
          <span class="ml-2">ANY selected tags (“or”)</span>
        </label>
      </div>
      <div class="mt-6 flex flex-col">
        <span>Display # of tasks per tag:</span>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="true" v-model="currentSettings.display_number_of_items_per_tag" />
          <span class="ml-2">Yes</span>
        </label>
        <label class="flex items-center pl-1">
          <input @change="onSettingsChanged" type="radio" :value="false" v-model="currentSettings.display_number_of_items_per_tag" />
          <span class="ml-2">No</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import ChevronLeftIcon from '@/assets/images/icons/chevron-left.svg';
import ChevronRightIcon from '@/assets/images/icons/chevron-right.svg';

export default {
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentSettings: this.settings
    };
  },
  methods: {
    async onSettingsChanged() {
      this.$emit('settings-updated', this.currentSettings);
    }
  }
};
</script>
