<template>
  <div>
    <BackButton @click="$emit('close')" class="m-3">Custom order</BackButton>
    <draggable :animation="100" :disabled="false" :force-fallback="true" v-model="list" handle=".handle" class="list">
      <div v-for="tag in tags" :key="tag.id" class="flex items-center tag px-4 py-2">
        <DragIcon class="w-4 h-4 handle cursor-move hover:text-primary" />
        <span class="block ml-5">{{ tag.name }}</span>
      </div>
    </draggable>
    <div class="actions">
      <button @click="save" class="flex items-center px-4 py-2 w-full hover:text-primary">
        <content-save-alert-outline-icon :size="19" />
        <span class="block ml-5">Save</span>
      </button>
      <button @click="reset" class="flex items-center px-4 py-2 w-full hover:text-primary">
        <autorenew-icon :size="19" />
        <span class="block ml-5">Reset</span>
      </button>
    </div>
  </div>
</template>

<script>
import BackButton from '@/components/settings/BackButton';
import Tag from '@/models/Tag';
import DragIcon from '@/assets/images/icons/drag.svg';
import draggable from 'vuedraggable';
import ContentSaveAlertOutlineIcon from 'vue-material-design-icons/ContentSaveAlertOutline';
import AutorenewIcon from 'vue-material-design-icons/Autorenew';

export default {
  components: {
    BackButton,
    DragIcon,
    draggable,
    ContentSaveAlertOutlineIcon,
    AutorenewIcon
  },
  data() {
    return {
      tags: [],
      initialOrder: {}
    };
  },
  computed: {
    list: {
      get() {
        return this.tags.sort((a, b) => a.order - b.order);
      },
      set(tags) {
        this.tags = tags.map((tag, index) => {
          tag.order = index + 1;
          return tag;
        });
      }
    }
  },
  methods: {
    async save() {
      for (let index = 0; index < this.tags.length; index++) {
        await this.tags[index].$save();
      }
    },
    reset() {
      this.tags = this.tags.map(tag => {
        tag.order = this.initialOrder[tag.id];
        return tag;
      });
    }
  },
  mounted() {
    this.tags = Tag.all();

    this.tags.forEach(tag => (this.initialOrder[tag.id] = tag.order));
  }
};
</script>

<style scoped>
.actions {
  height: 122px;
}

.list {
  height: calc(100% - 165px);
  overflow: auto;
  margin-top: 35px;
  margin-bottom: 20px;
}

.tag:hover,
.actions button:hover {
  background: #f2f2f2;
}

.dark .tag:hover,
.dark .actions button:hover {
  background: #303031;
}
</style>
