<template>
  <div class="h-full text-black dark:text-white md:py-3 md:px-8 lg:py-8 lg:px-20 text-base">
    <nav class="flex justify-between items-center my-2 mx-4">
      <ul class="flex ">
        <li class="text-lg text-gray-400">Inbox</li>
        <li class="separator bg-black dark:bg-white"></li>
        <li class="text-lg cursor-pointer">Tasks</li>
      </ul>
      <div>
        <SettingsDropdwnMenu />
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import CogOutlineIcon from 'vue-material-design-icons/CogOutline';
import SettingsDropdwnMenu from '@/components/SettingsDropdownMenu';

export default {
  components: {
    CogOutlineIcon,
    SettingsDropdwnMenu
  }
};
</script>

<style scoped>
.separator {
  width: 1px;
  height: 25px;
  margin: 0 15px;
}
</style>
