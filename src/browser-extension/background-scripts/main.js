
const browser = require('webextension-polyfill');

browser.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.message ==='version') {
    const manifest = chrome.runtime.getManifest();
    sendResponse({version: manifest.version})
    console.log(manifest.version)
  }
});
