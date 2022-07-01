export const isRunningAsAnExtension = () => {
  return (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || typeof browser !== 'undefined';
};

export const getExtensionVersion = () => {
  return new Promise((resolve, reject) => {
    const browser = window.chrome || window.browser;

    // If we are running as extension, we can directly get the version number
    if(isRunningAsAnExtension()){
      const version =  browser.runtime.getManifest().version
      resolve(version)
      return
    }
    
    const browserType = getBrowserType();

    // It is not Chrome or Firefox
    if (browserType != 'chrome' && browserType != 'firefox') {
      resolve(null);
      return;
    }

    if (browserType === 'firefox') {
      // To get the extension’s version on Firefox, we are relying on content script to expose getFirefoxExtensionVersion
      // using Firefox’s exportFunction
      if (typeof getFirefoxExtensionVersion === 'function') {
        const version = getFirefoxExtensionVersion();
        console.log('Firefox extension version: ', version);
        resolve(version);
        return;
      } else {
        // If it is Firefox, but getFirefoxExtensionVersion is not available.
        // That means the extension is not installed or getFirefoxExtensionVersion has not been declared for unknown reasons
        resolve(null);
        return;
      }
    }

    // It is Chrome
    const extensionId = getInstalledExtensionId();

    // This page cannot access chrome extension's runtime API, because either The extension is not installed
    // or this url was not added to externally_connectable.matches array
    if (!browser.runtime) {
      reject('Could not get version because the extension is not installed/enabled');
      return;
    }

    if (!extensionId) {
      resolve(null);
      return;
    }

    browser.runtime.sendMessage(extensionId, { message: 'version' }, function(response) {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError.message);
        return;
      }

      if (response && response.version) {
        resolve(response.version);
        console.log('Chrome extension version: ', response.version);
      } else {
        resolve(null);
      }
    });
  });
};

export const isExtensionInstalled = async () => {
  try {
    const version = await getExtensionVersion();

    if (version === null) return false;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getBrowserType = () => {
  if (navigator.userAgent.indexOf('Chrome') != -1) return 'chrome';
  if (navigator.userAgent.indexOf('Firefox') != -1) return 'firefox';

  return 'other';
};

export const getInstalledExtensionId = () => {
  const browserType = getBrowserType();
  
  const chromeExtensionId = 'lgpchgegecogdjhonnjbkaccjpnhlipa';
  const firefoxExtensionId = 'a8c5dca1214e19e4052fba219f81a1229ab276fa@temporary-addon';

  if (browserType === 'chrome') return chromeExtensionId;
  if (browserType === 'firefox') return firefoxExtensionId;

  return null;
};
