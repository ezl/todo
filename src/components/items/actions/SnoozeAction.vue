<template>
  <span class="relative snooze-action">
    <SnoozeIcon @click="toggleSnoozeOptions" :class="{ '!text-primary': showSnoozePeriodOptions }" class="icon text-secondary cursor-pointer hover:text-primary" />
    <div v-if="showSnoozePeriodOptions" class="snooze-period-options absolute z-20 flex items-center rounded-md bg-lotion dark:bg-dark-gunmetal shadow-md">
      <span>Snooze for:</span>
      <div class="flex justify-between ml-3 text-secondary">
        <span @click="onSnooze(1)" class="btn">1 day</span>
        <span @click="onSnooze(7)" class="btn">1 week</span>
        <span @click="onSnooze(30)" class="btn">1 month</span>
      </div>
    </div>
  </span>
</template>

<script>
import SnoozeIcon from '@/assets/images/icons/snooze.svg';

export default {
  components: {
    SnoozeIcon
  },
  props: {
    plural: {
      type: Boolean,
      default: false
    },
    usable: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      showSnoozePeriodOptions: false
    };
  },
  methods: {
    toggleSnoozeOptions() {
      if(!this.usable) return
      this.showSnoozePeriodOptions = !this.showSnoozePeriodOptions;
    },
    onSnooze(days) {
     this.$emit('begin-action', 'snooze')

      this.$notify({
        group: 'prompt',
        title: 'Snooze',
        text: `Do you really want to snooze ${this.plural ? 'these tasks' : 'this task'} for ${days} ${days > 1 ? 'days' : 'day'}?`,
        data: {
          actions: [
            {
              label: 'Cancel',
              callback: async close => {
                close()
                this.$emit('end-action')
              }
            },
            {
              label: 'Yes',
              callback: close => {
                close();

                this.$emit('snooze', days);
                this.$emit('end-action')
              }
            }
          ]
        }
      });

      this.showSnoozePeriodOptions = false;
    }
  },
  mounted(){
    document.addEventListener('click', (e) => {
      if(e.target.matches('.snooze-action *')) return 

        this.showSnoozePeriodOptions = false
    })
  }
};
</script>

<style scoped>
.snooze-period-options {
  width: 325px;
  padding: 5px 8px;
  top: 35px;
}

.btn {
  padding: 8px;
  margin-left: 5px;
  cursor: pointer;
}

.btn:hover {
  @apply bg-cultured text-primary;
}

.dark .btn:hover{
  background: #2d2b36;
}

@media only screen and (max-width: 1024px) {
  .snooze-period-options{
    top: -72px;
  }
}
</style>
