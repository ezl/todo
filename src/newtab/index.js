import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import '@/assets/css/main.css'

window.browser = require("webextension-polyfill");

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}) 