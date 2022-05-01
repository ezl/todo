import Vue from 'vue';
import App from './App.vue';
import router from '../router';
import store from '../store';
import '@/assets/css/main.css';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import LottieAnimation from 'lottie-web-vue';
import axios from 'axios';
require('../authentication')

Vue.use(LottieAnimation);

// we dont need to require this unless we are running as a browser extension
if ((typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || typeof browser !== 'undefined') {
  window.browser = require('webextension-polyfill');
}

axios.defaults.baseURL = 'http://localhost:8000/api';

(async () => {
  await LocalStorageHelper.restore();
  const auth = await LocalStorageHelper.getValue({ auth: {} });

  if (auth.token) store.commit('auth/SET_TOKEN', auth.token);
  if (auth.email) store.commit('auth/SET_EMAIL', auth.email);
  if (auth.clientTrackingToken) store.commit('auth/SET_CLIENT_TRACKING_TOKEN', auth.clientTrackingToken);

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  });
})();
