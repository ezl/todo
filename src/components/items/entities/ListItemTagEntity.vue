<template>
  <Tag :tag="tag" :interactive="false" class="inline-block text-xs !m-0 !p-1 "/>
</template>

<script>
import Tag from '@/components/tags/Tag';
import TagModel from '@/models/Tag';

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
  mounted(){
    // Add some margin if previous sibling was also a tag 
    if(this.$el.previousSibling.nodeType === Node.ELEMENT_NODE){
      this.$el.classList.add('!ml-1')
    }
  }
};
</script>