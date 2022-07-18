import Vue from 'vue';
import App from './App.vue';
import router from '../router';
import store from '../store';
import '@/assets/css/main.css';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import LottieAnimation from 'lottie-web-vue';
import axios from 'axios';
import Notifications from 'vue-notification'
import { sync } from '../sync'
import { isRunningAsAnExtension } from '@/helpers/extension'

require('../store/subscriber')
require('../authentication')

Vue.use(LottieAnimation);
Vue.use(Notifications)

console.log('APP_VERSION ',APP_VERSION)

// we dont need to require this unless we are running as a browser extension
if (isRunningAsAnExtension()) {
  window.browser = require('webextension-polyfill');
}

axios.defaults.baseURL = 'https://badtodo.com/api';

const init = async () => {
  await LocalStorageHelper.init();
  
  const auth = await LocalStorageHelper.getValue({ auth: {} });

  const currentAppVersion = await LocalStorageHelper.getValue({ appVersion: null })

  if(!currentAppVersion){
    await LocalStorageHelper.setValue({ items: [] })
    await LocalStorageHelper.setValue({ tags: [] })
    await LocalStorageHelper.setValue({ itemTagRelationships: [] })
  }
  
  await LocalStorageHelper.setValue({ appVersion: APP_VERSION })

  if (auth.token) {
    await store.commit('auth/SET_TOKEN', auth.token);
    // Sync with the server as soon as we retrieve currently logged in user’s token from the local storage
    sync()
  }

  if (auth.email) store.commit('auth/SET_EMAIL', auth.email);
  if (auth.clientTrackingToken) store.commit('auth/SET_CLIENT_TRACKING_TOKEN', auth.clientTrackingToken);
  
  trackPageLoads()

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  });
}

const trackPageLoads = () => {
  LocalStorageHelper.getValue({ numOfPageLoads: 0 }).then(numOfPageLoads => {
    numOfPageLoads++
    LocalStorageHelper.setValue({numOfPageLoads})
  })
}



init()