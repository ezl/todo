import Vue from 'vue';
import App from './App.vue';
import router from '../router';
import store from '../store';
import '@/assets/css/main.css';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

// we dont need to require this unless we are running as a browser extension
if(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id || typeof browser !== 'undefined'){
  window.browser = require('webextension-polyfill');
}

(async () => {
  await LocalStorageHelper.restore();

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  });
})();
