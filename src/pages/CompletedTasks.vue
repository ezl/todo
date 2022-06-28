<template>
  <div>
    <div v-if="items.length" class="w-full lg:w-8/12 lg:ml-16 mt-8 md:mt-16 mb-16">
      <!-- Today -->
      <div v-if="itemsCompletedToday.length" class="group !mt-20 md:m-0">
        <h4 class="heading flex items-center">
          <h4>Today ({{ itemsCompletedToday.length }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedToday" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- Yesterday -->
      <div v-if="itemsCompletedYesterday.length" class="group">
        <h4 class="heading flex items-center">
          <h4>Yesterday ({{ numOfItemsCompletedSinceYesterday }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedYesterday" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- This week -->
      <div v-if="itemsCompletedThisWeek.length" class="group">
        <h4 class="heading flex items-center">
          <h4>This Week ({{ numOfItemsCompletedThisWeek }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedThisWeek" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- Last week -->
      <div v-if="itemsCompletedLastWeek.length" class="group">
        <h4 class="heading flex items-center">
          <h4>Last Week ({{ numOfItemsCompletedSinceLastWeek }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedLastWeek" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- This month -->
      <div v-if="itemsCompletedThisMonth.length" class="group">
        <h4 class="heading flex items-center">
          <h4>This Month ({{ numOfItemsCompletedThisMonth }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedThisMonth" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- Last month -->
      <div v-if="itemsCompletedLastMonth.length" class="group">
        <h4 class="heading flex items-center">
          <h4>Last Month ({{ numOfItemsCompletedSinceLastMonth }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedLastMonth" :key="item.id" :item="item" />
        </div>
      </div>
      <!-- Everything before last month -->
      <div v-if="itemsCompletedBeforeLastMonth.length" class="group">
        <h4 class="heading flex items-center">
          <h4>All Time ({{ items.length }})</h4>
          <span class="divider"></span>
        </h4>
        <div class="list">
          <CompletedListItem v-for="item in itemsCompletedBeforeLastMonth" :key="item.id" :item="item" />
        </div>
      </div>
    </div>
    <div v-else class="text-center mt-20 md:mt-56 text-secondary">
      You have not completed any tasks yet
    </div>
  </div>
</template>

<script>
import CompletedListItem from '@/components/items/CompletedListItem';
import Item from '@/models/Item';
import moment from 'moment';

export default {
  components: {
    CompletedListItem
  },
  data() {
    return {
      today: null,
      yesterday: null,
      thisWeek: null,
      lastWeek: null,
      thisMonth: null,
      lastMonth: null
    };
  },
  computed: {
    items() {
      const items = Item.query()
        .where(item => item.completed_at != null)
        .with('tags')
        .get()
        .sort((a, b) => moment(b.completed_at).valueOf() - moment(a.completed_at).valueOf());

      return items;
    },
    itemsCompletedToday() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local();

        return completionDate.isAfter(this.today);
      });
    },
    itemsCompletedYesterday() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBetween(this.yesterday, this.today);
      });
    },
    numOfItemsCompletedSinceYesterday() {
      return this.itemsCompletedYesterday.length + this.itemsCompletedToday.length;
    },
    itemsCompletedThisWeek() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBetween(this.thisWeek, this.yesterday);
      });
    },
    numOfItemsCompletedThisWeek() {
      return this.numOfItemsCompletedSinceYesterday + this.itemsCompletedThisWeek.length;
    },
    itemsCompletedLastWeek() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBetween(this.lastWeek, this.thisWeek);
      });
    },
    numOfItemsCompletedSinceLastWeek() {
      return this.numOfItemsCompletedThisWeek + this.itemsCompletedLastWeek.length;
    },
    itemsCompletedThisMonth() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBetween(this.thisMonth, this.lastWeek);
      });
    },
    numOfItemsCompletedThisMonth() {
      return this.numOfItemsCompletedSinceLastWeek + this.itemsCompletedThisMonth.length;
    },
    itemsCompletedLastMonth() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBetween(this.lastMonth, this.thisMonth);
      });
    },
    numOfItemsCompletedSinceLastMonth() {
      return this.numOfItemsCompletedThisMonth + this.itemsCompletedLastMonth.length;
    },
    itemsCompletedBeforeLastMonth() {
      return this.items.filter(item => {
        const completionDate = moment.utc(item.completed_at).local()

        return completionDate.isBefore(this.lastMonth);
      });
    }
  },
  created() {
    this.today = moment().startOf('day');

    this.yesterday = moment().subtract(1, 'days');

    this.thisWeek = moment().subtract(8, 'days'); // 8 days from today

    this.lastWeek = moment().subtract(14, 'days'); // 14 days from today

    this.thisMonth = moment().subtract(30, 'days'); // 30 days from today

    this.lastMonth = moment().subtract(60, 'days').startOf('day') // 60 days from today
  }
};
</script>

<style scoped>
.group + .group {
  margin-top: 10px;
}

.heading h4 {
  text-align: right;
  width: 170px;
  @apply text-primary;
}

.heading .divider {
  height: 1px;
  margin-left: 15px;
  display: block;
  flex: 1;
  @apply bg-primary;
}

.group .list {
  margin-left: 206px;
  margin-top: 4px;
}

@media only screen and (max-width: 768px) {
  .group {
    padding: 0 15px;
  }

  .heading h4 {
    text-align: left;
    width: auto;
  }

  .group .list {
    margin-left: 2px;
    margin-top: 4px;
  }
}
</style>
