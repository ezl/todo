<template>
  <div class="h-full text-black dark:text-white py-3 md:px-8 lg:py-4 lg:px-20 text-base">
    <nav class="flex justify-between items-center mx-4">
      <ul class="flex items-center">
        <li class="text-lg cursor-pointer text-ree-500">
          <router-link :class="{'text-bold text-black': isActive('tasks')}" :to="{name: 'tasks'}">Tasks</router-link>
        </li>
        <li class="nav-item-divider"></li>
        <li class="text-lg cursor-pointer">
          <router-link :to="{ name: 'tasks.completed' }">Completed Tasks</router-link>
        </li>
      </ul>
      <div>
        <SettingsMenu @toggled="onSettingsMenuToggled" />
      </div>
    </nav>
    <router-view :class="{ 'blur-sm pointer-events-none': isSettingsMenuOpen }" />
    <notifications group="general" position="bottom right" width="100%" :duration="6000" :ignore-duplicates="true" />
    <ExtensionInstallationPrompt />
    <ExtensionUpdatePrompt />
  </div>
</template>

<script>
import CogOutlineIcon from 'vue-material-design-icons/CogOutline';
import SettingsMenu from '@/components/settings/SettingsMenu';
import ExtensionInstallationPrompt from '@/components/notifications/ExtensionInstallationPrompt';
import ExtensionUpdatePrompt from '@/components/notifications/ExtensionUpdatePrompt';
import Setting from '@/models/Setting';
import { setTheme } from '@/helpers/dom';

export default {
  components: {
    CogOutlineIcon,
    SettingsMenu,
    ExtensionInstallationPrompt,
    ExtensionUpdatePrompt
  },
  data() {
    return {
      isSettingsMenuOpen: false
    };
  },
  methods: {
    onSettingsMenuToggled(isOpen) {
      this.isSettingsMenuOpen = isOpen;
    },
    isActive(routeName) {
      return this.$route.name === routeName
    }
  },
  mounted() {
    const settings = Setting.retrieve();
    setTheme(settings.theme);
  }
};
</script>

<style scoped>
.nav-item-divider {
  margin: 0 12px;
  width: 1px;
  height: 24px;
  background: #747378;
}

nav li {
  color: #9E9EA1;
}

.router-link-exact-active{
  color: #1C1B22;
  font-weight: 500;
}

.dark .router-link-exact-active{
  color: #fff;
  font-weight: 500;
}

</style>
