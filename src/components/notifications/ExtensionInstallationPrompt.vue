<template>
  <BannerStyleNotification group="extension-intallation-prompt" ref="notification">
    <template slot="title">
      <p class="title md:text-center mr-4 md:m-0">
        <a :href="installationUrl" target="_blank" class="text-primary underline">Download our browser extension</a> to see your to do list in every browser
        tab.
      </p>
    </template>
  </BannerStyleNotification>
</template>

<script>
import { isRunningAsAnExtension, isExtensionInstalled, getBrowserType } from '@/helpers/extension';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import { CHROME_EXTENSION_DOWNLOAD_LINK, FIREFOX_EXTENSION_DOWNLOAD_LINK } from '@/constants';
import BannerStyleNotification from './templates/BannerStyleNotification';

export default {
  components: {
    BannerStyleNotification
  },
  data() {
    return {
      intervals: [10, 15, 20], // After how many refreshes should we show this?,
    };
  },
  computed: {
    installationUrl() {
      const browserType = getBrowserType();

      if (browserType === 'chrome') return CHROME_EXTENSION_DOWNLOAD_LINK;
      if (browserType === 'firefox') return FIREFOX_EXTENSION_DOWNLOAD_LINK;

      // default
      return CHROME_EXTENSION_DOWNLOAD_LINK;
    }
  },
  mounted() {
    window.onload = async () => {
      if (isRunningAsAnExtension()) return;
      // Uncomment this when the extensions are published and we have their IDs
      // if (await isExtensionInstalled()) return;

      // The last time we prompted the user to install the extension
      const displayedInstallationPromptAtPageLoadNum = await LocalStorageHelper.getValue({ displayedInstallationPromptAtPageLoadNum: 0 });
      const numOfPageLoads = await LocalStorageHelper.getValue({ numOfPageLoads: 0 });
      // How many page loads has it been since the last prompt?
      const pageLoadsSinceLastPrompt = numOfPageLoads - displayedInstallationPromptAtPageLoadNum;
      const randomInterval = this.intervals[Math.floor(Math.random() * this.intervals.length)];
      const biggestInterval = this.intervals.sort((a, b) => a - b)[this.intervals.length - 1];

      if (pageLoadsSinceLastPrompt == randomInterval || pageLoadsSinceLastPrompt >= biggestInterval) {
        LocalStorageHelper.setValue({ displayedInstallationPromptAtPageLoadNum: numOfPageLoads });

        this.$refs.notification.open()
      }
    };
  }
};
</script>
