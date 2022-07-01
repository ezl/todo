<template>
  <notifications group="prompt" position="bottom center" :duration="-1" width="45%">
    <template slot="body" slot-scope="{ item, close }">
      <div class="notification flex w-full items-center justify-between h-auto p-4 mb-4 rounded-md border border-red-500 bg-lotion dark:bg-dark-gunmetal">
        <div class="mr-4">
          <BellIcon v-if="!item.data.icon || item.data.icon == 'bell'" class="text-primary" width="30" height="31"/>
          <CheckCircleIcon v-if="item.data.icon == 'check'" class="text-primary" width="28" height="28" />
        </div>
        <div class="flex-1 text-sm">
          <h4 v-if="item.title" class="opacity-60 uppercase">{{ item.title }}</h4>
          <p v-if="item.text" class="text-sm mt-1">{{ item.text }}</p>
        </div>
        <div v-if="item.data.actions && item.data.actions.length" class="ml-3">
          <button
            v-for="(action, index) in item.data.actions"
            :key="index"
            @click="action.callback(close)"
            :class="{ 'ml-3': index > 0 }"
            class="bg-cultured px-2 py-1 text-sm action"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </template>
  </notifications>
</template>

<script>
import BellIcon from '@/assets/images/icons/bell.svg';
import CheckCircleIcon from '@/assets/images/icons/check-circle.svg';

export default {
  components: {
    BellIcon,
    CheckCircleIcon
  },
};
</script>

<style scoped>
.vue-notification-group{
  margin-bottom: 70px;
}

.action {
  background: #f2f2f2;
}

.dark .action {
  background: #141317;
}

@media only screen and (max-width: 768px) {
  .vue-notification-group{
    width: 90% !important;
    left: calc(5%) !important;
  }
}
</style>
