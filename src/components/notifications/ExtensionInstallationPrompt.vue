<template>
  <notifications group="extension-intallation-prompt" position="bottom right" width="100%" :duration="-1">
    <template slot="body">
      <div class="notification h-auto p-4 relative border-t border-secondary dark:border-none banner">
        <p class="title md:text-center mr-4 md:m-0">
          <a :href="installationUrl" target="_blank" class="text-primary underline">Download our browser extension</a> to see your to do list in every browser
          tab.
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
import { isRunningAsAnExtension, isExtensionInstalled, getBrowserType } from '@/helpers/extension';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import { CHROME_EXTENSION_DOWNLOAD_LINK, FIREFOX_EXTENSION_DOWNLOAD_LINK } from '@/constants';

export default {
  components: {
    CloseIcon
  },
  data() {
    return {
      notificationId: null,
      intervals: [10, 15, 20], // After how many refreshes should we show this?
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
  methods: {
    close() {
      this.$notify.close(this.notificationId);
    }
  },
  mounted() {
    window.onload = async () => {
      if (isRunningAsAnExtension()) return;
      // Uncomment this when the extensions are published and we have their IDs
      // if (await isExtensionInstalled()) return;

      this.notificationId = Date.now();
      // The last time we prompted the user to install the extension
      const displayedInstallationPromptAtPageLoadNum = await LocalStorageHelper.getValue({ displayedInstallationPromptAtPageLoadNum: 0 });
      const numOfPageLoads = await LocalStorageHelper.getValue({ numOfPageLoads: 0 });
      // How many page loads has it been since the last prompt?
      const pageLoadsSinceLastPrompt = numOfPageLoads - displayedInstallationPromptAtPageLoadNum;
      const randomInterval = this.intervals[Math.floor(Math.random() * this.intervals.length)]
      const biggestInterval = this.intervals.sort((a, b) => a - b)[this.intervals.length - 1]

      if (pageLoadsSinceLastPrompt == randomInterval || pageLoadsSinceLastPrompt >= biggestInterval ) {
        LocalStorageHelper.setValue({ displayedInstallationPromptAtPageLoadNum: numOfPageLoads });

        this.$notify({
          id: this.notificationId,
          group: 'extension-intallation-prompt'
        });
      }
    };
  }
};
</script>