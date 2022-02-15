<template>
  <span @click="onClick" :class="dynamicClassList" class="px-3 py-1 mr-2 mb-3 block cursor-pointer hover:bg-cultured dark:hover:bg-dark-charcoal">
    {{ tag.name }}
  </span>
</template>

<script>
export default {
  props: {
    tag: {
      required: true,
      type: Object
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    dynamicClassList(){
      if(!this.selected) return []

      return ['bg-cultured', 'dark:bg-dark-charcoal']
    }
  },
  methods: {
    onClick(e){
      this.$emit('click', e)
    }
  }
};
</script>
