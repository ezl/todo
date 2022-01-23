<template>
  <div class="text-white py-8 px-32 text-base">
    <nav class="flex justify-between items-center">
      <ul class="flex ">
        <li class="text-lg text-gray-400">Inbox</li>
        <li class="separator"></li>
        <li class="text-lg cursor-pointer">Tasks</li>
      </ul>
      <ul>
        <li class="p-2 rounded-md bg-tertiary cursor-pointer text-gray-400">
          <cog-outline-icon :size="32" />
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script>
import CogOutlineIcon from 'vue-material-design-icons/CogOutline';
export default {
  components: {
    CogOutlineIcon
  }
};
</script>

<style scoped>
.separator {
  width: 1px;
  height: 25px;
  background: rgb(224, 224, 224);
  margin: 0 15px;
}
</style>
