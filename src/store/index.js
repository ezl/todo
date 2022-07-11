import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM from '@vuex-orm/core';
import User from '../models/User';
import Item from '../models/Item';
import Tag from '../models/Tag';
import ItemTag from '../models/ItemTag';
import ItemUser from '../models/ItemUser';
import Setting from '../models/Setting';
import auth from './auth';

Vue.use(Vuex);

const database = new VuexORM.Database();

database.register(User);
database.register(Item);
database.register(Tag);
database.register(ItemTag);
database.register(ItemUser);
database.register(Setting);

export default new Vuex.Store({
  modules: {
    auth
  },
  mutations: {
    initialiseStore(state, oldState) {
      this.replaceState(Object.assign(state, oldState));
    }
  },
  plugins: [VuexORM.install(database)]
});
