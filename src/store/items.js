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
    ADD_ITEM(state, item) {
      // Using unshift instead of push because we need to add the new items at the very beginning of items array
      state.items.unshift(item);
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
    }
  },
  actions: {
    async getItems({ commit }) {
      const { items } = await browser.storage.local.get({ items: [] });

      commit('SET_ITEMS', items);
    },
    async addItem({ commit }, { name, completed }) {
      if (name === undefined || completed === undefined) {
        throw 'name and completed properties are missing';
      }

      const item = {
        id: uuidv4(),
        name,
        completed,
        order: 1, // will come handy when sorting
        createdAt: moment.utc().valueOf()
      };

      commit('ADD_ITEM', item);
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
    }
  },
  getters: {
    items(state) {
      return state.items;
    }
  }
};
