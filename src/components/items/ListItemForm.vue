<template>
  <div class="flex items-center">
    <div>
      <Checkbox v-model="completed" />
    </div>
    <div class="ml-1 w-full">
      <Input v-model="body" @submit="submit" ref="input" />
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Input from '@/components/inputs/Input';

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
    submit() {
      this.body = '';
    }
  },
  mounted() {
    this.$refs.input.focus();
  }
};
</script>
