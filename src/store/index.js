import Vue from 'vue';
import Vuex from 'vuex';
import VuexORM from '@vuex-orm/core';
import Item from '../models/Item';
import Tag from '../models/Tag';
import ItemTag from '../models/ItemTag';
import Setting from '../models/Setting';
import auth from './auth';

Vue.use(Vuex);

const database = new VuexORM.Database();

database.register(Item);
database.register(Tag);
database.register(ItemTag);
database.register(Setting);

export default new Vuex.Store({
  modules: {
    auth
  },
  plugins: [VuexORM.install(database)]
});
