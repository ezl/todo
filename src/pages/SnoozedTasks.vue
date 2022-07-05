<template>
  <div>
    <div v-if="items.length" class="w-full lg:w-6/12 mx-auto mt-8 md:mt-28 mb-16">
      <div v-for="item in items" :key="item.id" :ref="'item-' + item.id" class="item flex items-start">
        <button @click="onUnsnoozed(item)" class="unsnooze-btn hover:text-primary">unsnooze</button>
        <div class="ml-3 w-full text-dark-jungle-green dark:text-white px-3 py-2 rounded-lg">
          <ListItemBody :item="item" />
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-20 md:mt-56 text-secondary">
      You have no snoozed tasks
    </div>
  </div>
</template>

<script>
import ListItemBody from '@/components/items/ListItemBody';
import Item from '@/models/Item';
import moment from 'moment';

export default {
  components: {
    ListItemBody
  },
  data() {
    return {
      waitingForResponse: false
    };
  },
  computed: {
    items() {
      return Item.query()
        .with('tags')
        .where('completed_at', null)
        .where('discarded_at', null)
        .where('snoozed_until', value => {
          if (value === null) return false;

          const snoozeExpiryDate = moment.utc(value);
          const today = moment.utc();

          return today.isBefore(snoozeExpiryDate);
        })
        .get();
    }
  },
  methods: {
    onUnsnoozed(item) {
      if (this.waitingForResponse) return;

      this.waitingForResponse = true;

      this.$notify({
        group: 'prompt',
        title: 'Unsnooze',
        text: `Do you really want to unsnooze this task?`,
        data: {
          actions: [
            {
              label: 'Cancel',
              callback: async close => {
                this.waitingForResponse = false;
                close();
              }
            },
            {
              label: 'Yes',
              callback: close => {
                this.waitingForResponse = false;
                close();

                const targetTaskEl = this.$refs['item-' + item.id][0];

                targetTaskEl.classList.add('fade-out');

                // Wait for the fade out
                setTimeout(() => {
                  item.unsnooze();

                  this.$notify({
                    group: 'basic',
                    title: 'Unsnoozed',
                    text: 'Task successfully moved back to Tasks!'
                  });
                }, 350);
              }
            }
          ]
        }
      });
    }
  }
};
</script>

<style scoped>
.item {
  transition: opacity 0.5s ease-in;
  opacity: 100%;
}

.item.fade-out {
  opacity: 0;
}

.unsnooze-btn {
  background: #ededf0;
  color: #c0c0c0;
  border-radius: 555px;
  padding: 0 9px;
  margin-top: 7px;
}

.dark .unsnooze-btn {
  background: #2d2b36;
}

@media only screen and (max-width: 768px) {
  .unsnooze-btn {
    margin-left: 5px;
  }
}
</style>
