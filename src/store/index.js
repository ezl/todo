import Vue from 'vue';
import Vuex from 'vuex';
import items from './items';
import settings from './settings';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    items,
    settings
  }
});
