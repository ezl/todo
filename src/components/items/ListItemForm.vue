<template>
  <div class="flex items-center py-1">
    <div class="">
      <Checkbox v-model="completed" class="opacity-60" />
    </div>
    <div class="w-full">
      <Input
        v-model="body"
        @submit="submit"
        ref="input"
        placeholder-text="Start typing to create a list item..."
        class="ml-3"
        input-classes="px-3"
        @tag-selected="onTagSelected"
      />
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Input from '@/components/inputs/Input';
import createItem from '@/mixins/createItem';

export default {
  components: {
    Checkbox,
    Input
  },
  data() {
    return {
      isMobile: screen.width <= 768
    };
  },
  methods: {
    setFocusOnInput(e) {
      if (this.isMobile) return;

      // We need to first check if the input is currently visible in the viewport.
      // If it is not, we will not set focus on it to prevent the page’s scroll position from resetting
      const rect = this.$refs.input.$el.getBoundingClientRect();
      const isVisibleInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

      if (!isVisibleInViewport) {
        return;
      }

      // Always keep the input to create new list item focused if there are no other active inputs
      const inputSelectors = ['input', 'textarea', '[contenteditable="true"]', 'select'];
      for (let index = 0; index < inputSelectors.length; index++) {
        const selector = inputSelectors[index];
        if (document.activeElement.matches(selector)) return;
      }

      this.$refs.input.focus();
    }
  },
  mounted() {
    document.addEventListener('click', this.setFocusOnInput);
    // Set focus on the input when it becomes visible in the viewport
    document.addEventListener('scroll', (e) => {
      if(!this.$refs.input.isFocused()){
        this.setFocusOnInput()
      }
    });
  },
  mixins: [createItem]
};
</script>
