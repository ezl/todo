<template>
  <div class="popup bg-lotion dark:bg-dark-gunmetal z-20 p-3 text-xs w-48">
    <div>
      <h3>Editing {{ tag.name }}</h3>
    </div>
    <div class="mt-4">
      <h4 class="text-secondary">Actions</h4>
      <button @click="onDelete" class="mt-2 w-full flex justify-start hover:text-primary">
        <delete-outline-icon :size="15" />
        <span class="ml-1">Delete</span>
      </button>
    </div>
    <div class="divider bg-secondary"></div>
    <div>
      <h4 class="mb-1 text-secondary">Colors</h4>
      <div 
      @click="onChangeColor(color.name)" 
      v-for="(color, index) in colors" 
      :key="index" 
      class="flex items-center justify-between mt-3 cursor-pointer"
      >
        <div class="flex items-center">
          <span class="w-5 h-5 block" :style="{ 'background-color': color.background, 'color': color.text }"></span>
          <span class="ml-4">{{ color.name }}</span>
        </div>
        <check-icon v-if="isColorSelected(color)" :size="16" />
      </div>
    </div>
  </div>
</template>

<script>
import { TAG_COLORS } from '@/constants';
import { getCurrentTheme } from '@/helpers/general';
import CheckIcon from 'vue-material-design-icons/Check';
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline';

export default {
  components: {
    CheckIcon,
    DeleteOutlineIcon
  },
  props: {
    tag: {
      type: Object,
      required: true
    }
  },
  computed: {
    colors(){
       const theme = getCurrentTheme()
       const colors = []

       for (const key in TAG_COLORS) {
         const color = TAG_COLORS[key]
         if(!color[theme]) continue
         
         color.name = key
         colors.push({
           ...color[theme],
           name: key
         })
       }
       
       return colors
    }
  },
  methods: {
    isColorSelected(color) {
      return this.tag.color == color.name
    },
    onChangeColor(selectedColor) {
      this.$emit('change-color', selectedColor);
    },
    onDelete() {
      this.$emit('delete');
    }
  }
};
</script>

<style scoped>
.popup {
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.dark .popup {
  box-shadow: rgb(0 0 0 / 20%) 0px 7px 29px 0px;
}

.divider {
  height: 1px;
  margin: 15px 0;
  background: #747378;
  opacity: 50%
}
</style>
