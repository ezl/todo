import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import axios from 'axios';
import store from '../store';
import { handleServerChanges } from './server-change-handlers';

store.subscribe(mutation => {
  switch (mutation.type) {
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        sync()
      }
      break;
    default:
      break;
  }
});

export const sync = async () => {
  const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });
  const lastSyncedAt = await LocalStorageHelper.getValue({ lastSyncedAt: null });

  const latestLocalChangeLogs = changeLogs.filter(changeLog => changeLog.changed_at > lastSyncedAt);
  
  try {
    const response = await axios.post(`/sync/`, {
      last_synced_at: lastSyncedAt,
      change_logs: latestLocalChangeLogs
    });

    if (response.data.last_synced_at) {
      LocalStorageHelper.setValue({ lastSyncedAt: response.data.last_synced_at });
    } else {
      LocalStorageHelper.setValue({ lastSyncedAt: moment.utc().format() });
    }

    const latestRemoteChangeLogs = response.data.change_logs;
    handleServerChanges(latestRemoteChangeLogs);
  } catch (error) {
    console.error(error);
  }
};




