<template>
  <div class="w-6/12 mt-10 mx-auto">
    <div>
        <TagGroup />
    </div>
    <div class="mt-5">
        <ListItemForm />
        <div>
            <ListItem v-for="(item, index) in listItems" :key="index" :item="item" />
        </div>
    </div>
  </div>
</template>

<script>
import ListItemForm from '@/components/items/ListItemForm';
import ListItem from '@/components/items/ListItem';
import TagGroup from '@/components/tags/TagGroup';

export default {
  components: {
    ListItemForm,
    ListItem,
    TagGroup
  },
  data() {
    return {
      listItems: [
          {
              completed: false,
              name: 'Finish reading that bool'
          }
      ]
    };
  }
};
</script>
