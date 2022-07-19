<template>
  <Tag :tag="tag" :interactive="false" class="inline-block text-xs !m-0 !p-1 "/>
</template>

<script>
import Tag from '@/components/tags/Tag';
import TagModel from '@/models/Tag';
import listItemEntity from '@/mixins/listItemEntity'

export default {
  components: {
    Tag
  },
  props: {
    tagName: {
      type: String,
      required: true
    }
  },
  computed: {
    tag(){
      return TagModel.query().where('name', name => name.toLowerCase() == this.tagName.toLowerCase()).first();
    }
  },
  mixins: [listItemEntity]
};
</script>