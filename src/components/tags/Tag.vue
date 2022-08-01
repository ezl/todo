<template>
  <span
    @click="onClick"
    :style="styles"
    :class="{'cursor-pointer': interactive }"
    class="px-3 py-1 mr-2 mb-2 block rounded-full"
  >
    {{ name }}
  </span>
</template>

<script>
import Setting from '@/models/Setting';
import { getTagColorByName } from '@/helpers/tag-colors';

export default {
  props: {
    tag: {
      required: true,
      type: Object
    },
    interactive: {
      default: true,
      type: Boolean
    }
  },
  methods: {
    onClick(e) {
      if (!this.interactive) return;

      this.tag.toggled = !this.tag.toggled;
      this.tag.$save();

      this.$el.classList.remove('hover-state');
    },
  },
  computed: {
    settings() {
      return Setting.query().first();
    },
    name() {
      if (this.settings.display_number_of_items_per_tag && this.interactive) {
         return `${this.tag.name} (${this.tag.items.length})`;
      }

      return this.tag.name;
    },
    styles() {
      const obj = {};
      const selected = this.tag.toggled;

      const color = getTagColorByName(this.tag.color)

      if (selected && this.interactive || !this.interactive) {
        obj['background-color'] = color.background
        obj['color'] = color.text
      }
      
      return obj;
    }
  }
};
</script>
