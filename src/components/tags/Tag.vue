<template>
  <span
    @click="onClick"
    :style="styles"
    :class="{ 'font-bold dark:font-normal': !tag.toggled && interactive, 'cursor-pointer': interactive }"
    class="px-3 py-1 mr-2 mb-2 block rounded-full text-black"
  >
    {{ name }}
  </span>
</template>

<script>
import Setting from '@/models/Setting';
import { TAG_COLORS, FALLBACK_TAG_COLOR } from '@/constants';

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
  data() {
    return {
      defaultColor: FALLBACK_TAG_COLOR // will be used if tag does not have any color
    };
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
        // the number of not yet completed items
        const count = this.tag.items.filter(item => item.completed_at === null).length;
        return `${this.tag.name} (${count})`;
      }

      return this.tag.name;
    },
    styles() {
      const obj = {};
      const selected = this.tag.toggled;

      // default
      if (selected && this.interactive || !this.interactive) obj['background-color'] = this.defaultColor;
      if (!selected && this.interactive) obj['color'] = this.defaultColor;

      if (this.tag.color) {
        if (selected && this.interactive || !this.interactive) obj['background-color'] = this.tag.color;
        if (!selected && this.interactive) obj['color'] = this.tag.color;
      }

      return obj;
    }
  }
};
</script>
