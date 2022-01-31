import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export default {
  namespaced: true,
  state: {
    items: []
  },
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items;
    },
    ADD_ITEM(state, { item, placement }) {
      placement == 'top' ? state.items.unshift(item) : state.items.push(item);
    },
    UPDATE_ITEM(state, { id, updatedProperties }) {
      let itemToUpdateIndex;
      let itemToUpdate = state.items.find((item, index) => {
        if (item.id === id) {
          itemToUpdateIndex = index;
          return true;
        }

        return false;
      });

      if (itemToUpdate === undefined) {
        throw 'No matching item';
      }

      itemToUpdate = { ...itemToUpdate, ...updatedProperties };

      state.items.splice(itemToUpdateIndex, 1, itemToUpdate);
    },
    DELETE_ITEM(state, id){
      state.items = state.items.filter(item => item.id !== id)
    }
  },
  actions: {
    async getItems({ commit, rootGetters }) {
      let { items } = await browser.storage.local.get({ items: [] });

      if(rootGetters['settings/settings'].completed_preference == 'strikethrough_until_refresh'){
        items = items.filter(item => {
          console.log(item)
          return item.completed != true
        })
      }

      commit('SET_ITEMS', items);
    },
    async addItem({ commit, rootGetters }, { name, completed }) {
      if (name === undefined || completed === undefined) {
        throw 'name and completed properties are missing';
      }

      const item = {
        id: uuidv4(),
        name,
        completed,
        order: 0,
        createdAt: moment.utc().valueOf()
      };

      const placement = rootGetters['settings/settings'].new_item_placement;

      commit('ADD_ITEM', {
        item,
        placement
      });
    },
    async updateItem({ commit }, { id, updatedProperties }) {
      if (id === undefined) {
        throw 'Id is required to update item';
      }

      if (typeof updatedProperties !== 'object') {
        throw 'updateItem expects an object';
      }

      if (Object.keys(updatedProperties).length === 0) {
        throw 'updatedProperties is empty';
      }

      commit('UPDATE_ITEM', {
        id,
        updatedProperties
      });
    },
    async updateItems({ commit }, items) {
      if (items === undefined) {
        throw 'items param is required';
      }

      commit('SET_ITEMS', items);
    },
    async deleteItem({ commit }, id) {
      if (id === undefined) {
        throw 'item id required';
      }

      commit('DELETE_ITEM', id);
    },
  },
  getters: {
    items(state) {
      return state.items.sort();
    }
  }
};
