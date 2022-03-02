<template>
  <div class="flex items-center justify-center py-1 list-item-form">
    <div>
      <Checkbox v-model="completed" class="opacity-60" />
    </div>
    <div class="ml-4 w-full">
      <Input v-model="body" @submit="submit" ref="input" placeholder-text="Start typing to create a list item..." />
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
      body: ''
    };
  },
  methods: {
    async submit() {
      if (this.body.trim().length == 0) {
        return;
      }

      const item = await Item.add(this.body, this.completed);

      this.body = '';
      this.completed = false;
    }
  },
  mounted() {
    document.addEventListener('click', e => {
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

<style scoped>
.list-item-form {
  margin-left: 238px;
}
</style>
