<template>
  <div class="flex items-center">
    <button @click="show" :class="{'text-primary': expand}" class="text-secondary hover:text-primary z-10 relative h-10">
      <SearchIcon />
    </button>
    <div :class="{ show: expand }" class="search-input-wrapper flex items-center">
      <div class="relative flex-1">
        <input
          type="text"
          ref="input"
          v-model="query"
          @input="onChange"
          @keydown="onKeyDown"
          :class="{ '': expand }"
          :disabled="!expand"
          class=" w-full text-dark-jungle-green dark:text-white focus:outline-none caret-primary p-2"
        />
        <button
          @click="clear"
          :class="{ inactive: query.length === 0 }"
          class="clear-btn ml-3 absolute m-4 right-0 top-0 bottom-0 flex justify-center items-center"
        >
          <CloseIcon class="w-5 h-5 opacity-60" />
        </button>
        <div v-if="query.length" class="search-results-info">
          <span v-if="resultsCount">{{ resultsCount }} results for "{{ query }}"</span>
          <span v-else>we could not find any results for "{{ query }}"</span>
        </div>
      </div>
      <button @click="close" :class="{ invisible: !expand }" class="ml-3">cancel</button>
    </div>
  </div>
</template>

<script>
import SearchIcon from '@/assets/images/icons/search.svg';
import CloseIcon from '@/assets/images/icons/close.svg';

export default {
  components: {
    SearchIcon,
    CloseIcon
  },
  props: ['resultsCount'],
  data() {
    return {
      expand: false,
      query: ''
    };
  },
  methods: {
    show() {
      this.expand = true;
      this.$nextTick(() => this.$refs.input.focus());

      document.querySelector('.tags-wrapper').classList.add('hide');
      document.querySelector('.tags-wrapper').classList.add('pointer-events-none');
    },
    close() {
      this.expand = false;
      this.clear();

      document.querySelector('.tags-wrapper').classList.remove('hide');
      document.querySelector('.tags-wrapper').classList.remove('pointer-events-none');
    },
    clear() {
      this.query = '';
      this.$emit('input', '');

      if (this.expand) this.$refs.input.focus();
    },
    onChange(e) {
      this.$emit('input', e.target.value);
    },
    onKeyDown(e){
      if (e.key === 'Escape') this.close();
    }
  }
};
</script>

<style scoped>
.search-input-wrapper {
  position: absolute;
  top: -1.5px;
  left: -14px;
  right: 0;
  width: 1px;
  opacity: 0;
  transition: width 0.4s, opacity 0.6s;
}

.search-input-wrapper.show {
  width: calc(100% + 24px);
  opacity: 100%;
}

.search-input-wrapper input {
  padding-left: 55px;
  z-index: 6;
}

.clear-btn {
  transition: opacity 0.7s;
  opacity: 100%;
}

.clear-btn.inactive {
  opacity: 0;
  pointer-events: none;
}

.search-results-info {
  position: absolute;
  @apply text-secondary;
  font-size: 12px;
  bottom: -26px;
  left: 44px;
}

@media only screen and (max-width: 480px) {
  .search-input-wrapper.show {
    width: calc(100%);
    opacity: 100%;
  }
}
</style>
