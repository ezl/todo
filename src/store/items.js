import moment from 'moment';

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
        name,
        completed,
        order: 1, // will come handy when sorting
        createdAt: moment.utc().valueOf()
      };

      const { items } = await browser.storage.local.get({ items: [] });
      items.push(item);

      await browser.storage.local.set({ items });

      commit('ADD_ITEM', item);
    }
  },
  getters: {
    items(state) {
      return state.items;
    }
  }
};
