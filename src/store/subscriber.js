import LocalStorageHelper from '../helpers/LocalStorageHelper';
import store from './index';

// Persist Vuex state whenever it changes 
store.subscribe((mutation, state) => {
    // Sometimes, we might make changes to the store which would trigger 
    // this function before we finish initializing. To avoid potentially 
    // overwriting previous state with default/partial state, start persisting 
    // after we successfully initialized it
  if(!LocalStorageHelper.isStoreInitialized()) return

  LocalStorageHelper.setValue({ store: state });
});
