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
import Item from '@/models/Item';
import Tag from '@/models/Tag';

export default {
  components: {
    Checkbox,
    Input
  },
  data() {
    return {
      completed: false,
      body: '',
      isMobile: screen.width <= 768,
      selectedTags: []
    };
  },
  methods: {
    async submit() {
      if (this.body.trim().length == 0) {
        return;
      }

      const item = await Item.add(this.body, this.completed);
      await item.assignSelectedTags(this.selectedTags);
      item.updateTagPositionsInBody();

      this.body = '';
      this.completed = false;
      this.selectedTags = [];
    },
    onTagSelected(tagInfo) {
      this.selectedTags.push(tagInfo);
    }
  },
  mounted() {
    document.addEventListener('click', e => {
      if (this.isMobile) return;

      // Always keep the input to create new list item focused if there are no other active inputs
      const inputSelectors = ['input', 'textarea', '[contenteditable="true"]', 'select'];
      for (let index = 0; index < inputSelectors.length; index++) {
        const selector = inputSelectors[index];
        if (document.activeElement.matches(selector)) return;
      }

      this.$refs.input.focus();
    });
  }
};
</script>

<style scoped></style>
