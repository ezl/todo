<template>
  <BannerStyleNotification group="extension-update-prompt" ref="notification">
    <template slot="title">
      <p class="title md:text-center mr-4 md:m-0">
        Your browser extension is out of date. Please update it
        <a :href="updateUrl" target="_blank" class="text-primary underline">here</a>
      </p>
    </template>
  </BannerStyleNotification>
</template>

<script>
import { isRunningAsAnExtension, getBrowserType, getExtensionVersion } from '@/helpers/extension';
import { CHROME_EXTENSION_DOWNLOAD_LINK, FIREFOX_EXTENSION_DOWNLOAD_LINK } from '@/constants';
import BannerStyleNotification from './templates/BannerStyleNotification';
import axios from 'axios';
const semver = require('semver');

export default {
  components: {
    BannerStyleNotification
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
        this.$refs.notification.open()
      }
    } catch (error) {
      console.error(error);
    }
  }
};
</script>
