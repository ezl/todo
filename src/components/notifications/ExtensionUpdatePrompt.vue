<template>
  <notifications group="extension-update-prompt" position="bottom right" width="100%" :duration="-1">
    <template slot="body">
      <div class="notification h-auto p-4 relative border-t border-secondary dark:border-none banner">
        <p class="title md:text-center mr-4 md:m-0">
          Your browser extension is out of date. Please update it
          <a :href="updateUrl" target="_blank" class="text-primary underline">here</a>
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
import { isRunningAsAnExtension, getBrowserType, getExtensionVersion } from '@/helpers/extension';
import { CHROME_EXTENSION_DOWNLOAD_LINK, FIREFOX_EXTENSION_DOWNLOAD_LINK } from '@/constants';
import axios from 'axios';
const semver = require('semver');

export default {
  components: {
    CloseIcon
  },
  data() {
    return {
      notificationId: null
    };
  },
  computed: {
    updateUrl() {
      const browserType = getBrowserType();

      if (browserType === 'chrome') return CHROME_EXTENSION_DOWNLOAD_LINK;
      if (browserType === 'firefox') return FIREFOX_EXTENSION_DOWNLOAD_LINK;

      // fallback
      return CHROME_EXTENSION_DOWNLOAD_LINK;
    }
  },
  methods: {
    close() {
      this.$notify.close(this.notificationId);
    },
    async getLatestVersion() {
      try {
        const response = await axios.get('latest-app-version');
        console.log(response.data);
        return response.data.version;
      } catch (error) {
        throw error;
      }
    }
  },
  async mounted() {
    if (!isRunningAsAnExtension()) return;

    try {
      const currentVersion = await getExtensionVersion();
      const latestVersion = await this.getLatestVersion();
      const diff = semver.diff(currentVersion, latestVersion);

      if (diff != null) {
        this.notificationId = Date.now();
        this.$notify({
          id: this.notificationId,
          group: 'extension-update-prompt'
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
};
</script>