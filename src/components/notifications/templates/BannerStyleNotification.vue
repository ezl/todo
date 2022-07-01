<template>
  <notifications :group="group" position="bottom right" width="100%" :duration="-1">
    <template slot="body">
      <div class="notification h-auto p-4 relative border-t border-secondary dark:border-none">
        <p class="title md:text-center mr-4 md:m-0">
          <slot name="title"></slot>
        </p>
        <button class="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-black" @click="close">
          <close-icon :size="21" />
        </button>
      </div>
    </template>
  </notifications>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';

export default {
  components: {
    CloseIcon
  },
  props: {
    group: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      notificationId: null
    };
  },
  methods: {
    open() {
      if (this.notificationId) return;

      this.notificationId = Date.now();

      this.$notify({
        id: this.notificationId,
        group: this.group
      });
    },
    close() {
      this.$notify.close(this.notificationId);
      this.notificationId = null;
    }
  }
};
</script>

<style scoped>
.notification {
  background: #f2f2f2;
  border-top: 2px solid #c4c4c4;
}

.dark .notification {
  background: #4b4949;
  border-top: 2px solid #928c8c;
}
</style>
