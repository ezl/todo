<template>
  <notifications group="basic" position="bottom center" :duration="2500" width="30%">
    <template slot="body" slot-scope="{ item, close }">
      <div class="notification flex w-full items-center justify-between h-auto p-4 mb-4 rounded-md border border-red-500 bg-lotion dark:bg-dark-gunmetal">
        <div class="mr-4">
          <BellIcon class="text-primary" width="30" height="31" />
        </div>
        <div class="flex-1 text-sm">
          <h4 v-if="item.title" class="opacity-60 uppercase">{{ item.title }}</h4>
          <p v-if="item.text" class="text-sm mt-1">{{ item.text }}</p>
        </div>
      </div>
    </template>
  </notifications>
</template>

<script>
import BellIcon from '@/assets/images/icons/bell.svg';

export default {
  components: {
    BellIcon
  }
};
</script>

<style scoped>
.vue-notification-group {
  margin-bottom: 70px;
}

.action {
  background: #f2f2f2;
}

.dark .action {
  background: #141317;
}

@media only screen and (max-width: 1024px) {
  .vue-notification-group {
    width: 90% !important;
    left: calc(5%) !important;
  }
}
</style>
