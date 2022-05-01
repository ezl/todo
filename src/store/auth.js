import axios from 'axios';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

export default {
  namespaced: true,
  state: {
    token: null,
    email: null,
    sending_email: false,
    client_tracking_token: null
  },
  getters: {
    isLoggedIn(state) {
      return state.token && state.email;
    },
    email(state) {
      return state.email;
    },
    isSendingEmail(state) {
      return state.sending_email;
    },
    clientTrackingToken(state) {
      return state.client_tracking_token;
    },
    isAwaitingVerification(state) {
      return state.client_tracking_token && state.email && !state.token;
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_EMAIL(state, email) {
      state.email = email;
    },
    SET_SENDING_EMAIL(state, bool) {
      state.sending_email = bool;
    },
    SET_CLIENT_TRACKING_TOKEN(state, clientTrackingToken) {
      state.client_tracking_token = clientTrackingToken;
    }
  },
  actions: {
    async sendVerificationEmail({ commit }, email) {
      commit('SET_SENDING_EMAIL', true);
      try {
        const response = await axios.post('auth/send-verification/', { email });
        commit('SET_SENDING_EMAIL', false);
        commit('SET_EMAIL', email);
        commit('SET_CLIENT_TRACKING_TOKEN', response.data.client_tracking_token);

        LocalStorageHelper.setValue({
          auth: {
            clientTrackingToken: response.data.client_tracking_token,
            email,
            token: null
          }
        });
      } catch (error) {
        commit('SET_SENDING_EMAIL', false);
        console.error(error);
      }
    },
    logout({ commit }){
      commit('SET_EMAIL', null);
      commit('SET_CLIENT_TRACKING_TOKEN', null);
      commit('SET_TOKEN', null);
      LocalStorageHelper.setValue({auth: {}});
    }
  }
};
