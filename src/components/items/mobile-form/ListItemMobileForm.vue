<template>
  <div class="modal-wrapper">
    <div class="flex justify-between items-center bg-lotion dark:bg-dark-gunmetal">
      <button @click="close">
        <ChevronLeftIcon class="text-primary h-10 w-10 align-middle inline-block m-0" />
      </button>
      <button @click="save" :class="{ 'opacity-60': !body.length }" class="p-2 px-4">Save</button>
    </div>
    <div @click.self="giveFucusToTheInput" class="body">
      <Input
      v-model="body"
      @submit="save"
      ref="input"
      placeholder-text="Start typing to create a list item..."
      class="p-2"
      input-classes="!rounded-none"
      @tag-selected="onTagSelected"
    />
    </div>
  </div>
</template>

<script>
import Checkbox from '@/components/inputs/Checkbox';
import Input from '@/components/inputs/Input';
import createItem from '@/mixins/createItem';
import ChevronLeftIcon from '@/assets/images/icons/chevron-left.svg';

export default {
  components: {
    Checkbox,
    Input,
    ChevronLeftIcon
  },
  methods: {
    giveFucusToTheInput() {
      this.$refs.input.focus();
    },
    async save() {
      const successfullyCreated = await this.submit();
      if (successfullyCreated) this.close();
    },
    close() {
      this.$el.classList.remove('opened');

      // wait for closing animation to finsh
      setTimeout(() => this.$emit('close'), 300);
    }
  },
  mounted() {
    this.$el.classList.add('opened');
  },
  mixins: [createItem]
};
</script>

<style >
.modal-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 999;
  transition: 0.3s transform ease-in-out, opacity 0.3s !important;
  transform: translateY(calc(100%));
  opacity: 0;
  height: 100%;
}

.modal-wrapper .body {
  overflow: auto;
  height: 100%;
}

.modal-wrapper.opened {
  transform: translateY(0);
  opacity: 100%;
}

.modal-wrapper .body {
  background: #f2f2f2;
}

.dark .modal-wrapper .body {
  background: #141317;
}
</style>
