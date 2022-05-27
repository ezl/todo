<template>
  <span
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :class="{ selected: tag.toggled }"
    :style="styles"
    class="px-3 py-1 mr-2 mb-2 block cursor-pointer tag"
  >
    {{ name }}
  </span>
</template>

<script>
import Setting from '@/models/Setting';

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
  },
  computed: {
    settings() {
      return Setting.query().first();
    },
    name() {
      if (this.settings.display_number_of_items_per_tag) {
        // the number of not yet completed items
        const count = this.tag.items.filter(item => item.completed_at === null).length;
        return `${this.tag.name} (${count})`;
      }

      return this.tag.name;
    },
    styles() {
      const obj = {};
      // default
      obj['background-color'] = '#dbeddb ';

      if (this.tag.color) {
        obj['background-color'] = this.tag.color;
      }

      return obj;
    }
  }
};
</script>

<style scoped>
span {
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: 500px;
  color: #000;
}

.dark span {
  border-color: #525257;
}

span.hover-state {
  border-color: #a7a7a7;
}

span.selected {
  border-color: #a7a7a7;
}

.dark span.selected {
  border-color: #fff;
}

.dark span.hover-state {
  border-color: #fff;
}
</style>
