export default {
  namespaced: true,
  state: {
    items: []
  },
  mutations: {
      SET_ITEMS(state, items){
          state.items = items
      }
  },
  actions: {
      async getItems({ commit }){
        // TODO
      }
  },

}