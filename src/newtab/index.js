import Vue from 'vue';
import App from './App.vue';
import router from '../router';
import store from '../store';
import '@/assets/css/main.css';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

window.browser = require('webextension-polyfill');

(async () => {
  await LocalStorageHelper.restore();

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  });
})();
