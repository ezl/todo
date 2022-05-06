import store from './store';
import axios from 'axios';
import LocalStorageHelper from './helpers/LocalStorageHelper';
import Item from './models/Item';
import Tag from './models/Tag';

let verificationStatusCheckTimerId = null;

store.subscribeAction({
  after: (action, state) => {
    // Start tracking verification status as soon as the verification link is sent to the user
    if (action.type === 'auth/sendVerificationEmail' && store.getters['auth/isAwaitingVerification']) {
      startCheckingVerificationStatus(state.auth.client_tracking_token);
    }

    if (action.type === 'auth/logout') onLogout();
  }
});

store.subscribe(mutation => {
  switch (mutation.type) {
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + mutation.payload;
      } else {
        axios.defaults.headers.common['Authorization'] = null;
      }
      break;
    case 'auth/SET_CLIENT_TRACKING_TOKEN':
      if(mutation.payload) loginVerification()
      break;
    default:
      break;
  }
});

window.onfocus = function () { 
  loginVerification()
};

const onLogin = async (token) => {
  const auth = await LocalStorageHelper.getValue({ auth: {} });
  auth.token = token;
  auth.verified = true;
  LocalStorageHelper.setValue({ auth });

  await store.commit('auth/SET_TOKEN', token);

  clearInterval(verificationStatusCheckTimerId);
  verificationStatusCheckTimerId = null
  getUserData();
}

const onLogout = async () => {
  // Abort checking verification status if user signs out
  if (verificationStatusCheckTimerId != null) {
    clearInterval(verificationStatusCheckTimerId);
    verificationStatusCheckTimerId = null
  }

  // clear items/tags
  Item.deleteAll()
  Tag.deleteAll()
  LocalStorageHelper.setValue({items: []})
  LocalStorageHelper.setValue({tags: []})
  LocalStorageHelper.setValue({itemTagRelationships: []})

};

const loginVerification = async () => {
  const auth = await LocalStorageHelper.getValue({ auth: {} });

  const isAwaitingVerification = auth.clientTrackingToken && auth.email && !auth.token;

  if (isAwaitingVerification) {
    startCheckingVerificationStatus(auth.clientTrackingToken);
  }

  // Get user list items if we haven’t already, assuming verification was successful
  if (auth.token && !auth.initialized_data) {
    getUserData();
  }
};

const startCheckingVerificationStatus = clientTrackingToken => {
  if (verificationStatusCheckTimerId != null) return;

  verificationStatusCheckTimerId = setInterval(() => checkVerificationStatus(clientTrackingToken), 5000);

  // stop after 5mins
  setTimeout(() => {
    console.log('timeout')
    clearInterval(verificationStatusCheckTimerId)
    verificationStatusCheckTimerId = null
  }, 30000);
};

const checkVerificationStatus = async clientTrackingToken => {
  const auth = await LocalStorageHelper.getValue({ auth: {} });

  // Verification process completed
  if (auth.verified) return;

  try {
    const response = await axios.get(`auth/check-verification-status/?client-tracking-token=${clientTrackingToken}`);
    const { verified, token = null } = response.data;

    if (!verified) return;

    if (token != null) {
      onLogin(token)
    }
  } catch (error) {
    console.error(error);
  }
};

const getUserData = async () => {
  try {
    // Get every change that was created offline (does not belong to any particular account),
    // and attach them to currently logged in user’s account 
    let changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });

    const response = await axios.post(`/user-data/`, {
      change_logs: changeLogs
    });

    Tag.insert({
      data: [...response.data.tags]
    });

    Item.insert({
      data: [...response.data.items]
    });

    const auth = await LocalStorageHelper.getValue({ auth: {} });
    auth.initialized_data = true;
    LocalStorageHelper.setValue({ lastSyncedAt: response.data.last_synced_at });
    LocalStorageHelper.setValue({ auth });
  } catch (error) {
    console.error(error);
  }
};

