export default {
  namespaced: true,
  state: {
    settings: {}
  },
  mutations: {
    SET_SETTINGS(state, settings) {
      state.settings = settings;
    }
  },
  actions: {
    async getSettings({ commit }) {
      const defaults = {
        new_item_placement: 'top',
        theme: 'dark',
        completed_preference: 'strikethrough_until_refresh'
      };

      const { settings } = await browser.storage.local.get({ settings: defaults });

      commit('SET_SETTINGS', settings);
    },
    async updateSettings({ commit }, settings) {
      if (settings === undefined) {
        throw 'settings is required';
      }

      commit('SET_SETTINGS', settings);
    }
  },
  getters: {
    settings(state) {
      return state.settings;
    }
  }
};
