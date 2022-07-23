<template>
  <span @click="onClick" :class="{'!border-primary bg-primary !text-white': selected}" class="select-action w-5 h-5 rounded-full border-2 border-secondary cursor-pointer text-transparent hover:border-primary">
    <check-icon :size="16" class="flex justify-center items-center"/>
  </span>
</template>

<script>
import CheckIcon from 'vue-material-design-icons/Check';

export default {
  components: {
    CheckIcon
  },
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    usable: {
      type: Boolean,
      default: true
    },
  },
  methods: {
    onClick(){
      if(this.usable || this.selected) this.$emit('click')
 
      if(!this.selected){
        this.$emit('begin-action', 'select')
      }else{
        this.$emit('end-action')
      }
    }
  }
};
</script>