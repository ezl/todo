import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import axios from 'axios';
import { handleServerChanges } from './server-change-handlers';

let syncTimerId = null

// Schedules syncing, useful when we don’t want to sync immediately and delay it for few seconds
export const syncDelayed = async () => {
  // Avoid calling sync multiple times 
  if(syncTimerId) return

  syncTimerId = setTimeout( sync, 3000);
}


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
    clearTimeout(syncTimerId)
    syncTimerId = null
  } catch (error) {
    console.error(error);
  }
};




