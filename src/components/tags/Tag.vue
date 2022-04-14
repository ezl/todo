<template>
  <span
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :class="{ selected: tag.toggled }"
    class="px-3 py-1 mr-2 block cursor-pointer tag"
  >
    {{ tag.name }}
  </span>
</template>

<script>
export default {
  props: {
    tag: {
      required: true,
      type: Object
    }
  },
  methods: {
    onClick(e) {
      this.tag.toggled = !this.tag.toggled;
      this.tag.$save();

      this.$el.classList.remove('hover-state');
    },
    onMouseEnter() {
      this.$el.classList.add('hover-state');
    },
    onMouseLeave() {
      this.$el.classList.remove('hover-state');
    }
  }
};
</script>

<style scoped>
span {
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  border-radius: 500px;
  color: #dbdbdc;
}

.dark span {
  color: #525257;
}

span.hover-state {
  border-color: #e9e9e9;
}

span.selected {
  background: rgba(28, 27, 34, 0.1);
  color: #000;
}

.dark span.selected {
  background: #303031;
  color: #e9e9e9;
}

.dark span.hover-state {
  border-color: #303031;
}

.dark span.hover-state {
  border-color: #303031;
}
</style>
