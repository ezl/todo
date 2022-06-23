<template>
  <div class="h-full text-black dark:text-white md:py-3 md:px-8 lg:py-8 lg:px-20 text-base">
    <nav class="flex justify-between items-center my-2 mx-4">
      <ul class="flex ">
        <li class="text-lg cursor-pointer">Tasks</li>
      </ul>
      <div>
        <SettingsMenu @toggled="onSettingsMenuToggled"/>
      </div>
    </nav>
    <router-view :class="{'blur-sm pointer-events-none': isSettingsMenuOpen}"/>
    <notifications position="bottom right" width="100%" :duration="6000" :ignore-duplicates="true"/>
  </div>
</template>

<script>
import CogOutlineIcon from 'vue-material-design-icons/CogOutline';
import SettingsMenu from '@/components/settings/SettingsMenu';
import Setting from '@/models/Setting';
import { setTheme } from '@/helpers/dom';

export default {
  components: {
    CogOutlineIcon,
    SettingsMenu
  },
  data(){
    return {
      isSettingsMenuOpen: false
    }
  },
  methods: {
    onSettingsMenuToggled(isOpen){
      this.isSettingsMenuOpen = isOpen
    },
  },
  mounted(){
    const settings = Setting.retrieve();
    setTheme(settings.theme)
  }
};
</script>