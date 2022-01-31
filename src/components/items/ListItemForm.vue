<template>
  <div class="flex items-start py-1 px-2">
    <div>
      <Checkbox v-model="completed" @click="refocusInput" />
    </div>
    <div class="ml-1 w-full">
      <Input v-model="body" @submit="submit" ref="input" />
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Input from '@/components/inputs/Input';
import { mapActions } from 'vuex';

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
    ...mapActions({
      addItem: 'items/addItem'
    }),
    async submit() {
      if (this.body.trim().length == 0) {
        return
      }

      try {
        await this.addItem({
          name: this.body,
          completed: this.completed
        });

        this.body = '';
        this.completed = false;
      } catch (error) {
        console.error(error)
      }
    },
    refocusInput() {
      // For smoother user experience, bring focus back to the input whenever the user toggles the completion checkbox.
      this.$refs.input.focus();
    }
  }
};
</script>
