<template>
  <div class="w-6/12 mt-16 mx-auto">
    <div>
      <TagGroup />
    </div>
    <div class="mt-8">
      <ListItemForm />
      <div>
        <ListItem v-for="(item, index) in items" :key="index" :item="item" class="mt-3" />
      </div>
    </div>
  </div>
</template>

<script>
import ListItemForm from '@/components/items/ListItemForm';
import ListItem from '@/components/items/ListItem';
import TagGroup from '@/components/tags/TagGroup';
import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    ListItemForm,
    ListItem,
    TagGroup
  },
  data() {
    return {};
  },
  methods: {
    ...mapActions({
      getItems: 'items/getItems'
    })
  },
  computed: {
    ...mapGetters({
      items: 'items/items'
    })
  },
  mounted() {
    this.getItems();
  }
};
</script>
