import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import axios from 'axios';
import { handleServerChanges } from './server-change-handlers';

let syncTimerId = null;
// The number of times we tried to sync with the server after the initial attempt failed
let syncAttempts = 0;
// After how many tries should we give up?
let maxSyncAttempts = 3;

// Schedules syncing, useful when we don’t want to sync immediately and delay it for few seconds
export const syncDelayed = async ms => {
  // Avoid calling sync multiple times
  if (syncTimerId) return;

  if (ms === undefined) ms = 3000;

  syncTimerId = setTimeout(sync, ms);
};

export const sync = async () => {
  const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });
  const lastSyncedAt = await LocalStorageHelper.getValue({ lastSyncedAt: null });

  const latestLocalChangeLogs = changeLogs.filter(changeLog => changeLog.changed_at > lastSyncedAt);

  try {
    syncAttempts++;

    const response = await axios.post(`/sync/`, {
      last_synced_at: lastSyncedAt,
      change_logs: latestLocalChangeLogs
    });

    if (response.status != 200) {
      onSyncFailed();
      return;
    }

    console.log('Synced!')

    if (response.data.last_synced_at) {
      LocalStorageHelper.setValue({ lastSyncedAt: response.data.last_synced_at });
    } else {
      LocalStorageHelper.setValue({ lastSyncedAt: moment.utc().format() });
    }

    const latestRemoteChangeLogs = response.data.change_logs;
    handleServerChanges(latestRemoteChangeLogs);
    resetDelayedSyncTimer()
    syncAttempts = 0;
  } catch (error) {
    console.error(error);
    onSyncFailed();
  }
};

const onSyncFailed = () => {
  console.log(`Failed to synced. Attemps number: ${syncAttempts}`);
  if (syncAttempts < maxSyncAttempts) {
    console.log('retrying...');
    resetDelayedSyncTimer()
    syncDelayed(5000);
  }else{
    console.log(`Could not sync even after retrying ${syncAttempts} times`)
    resetDelayedSyncTimer()
    syncAttempts = 0
  }
};

const resetDelayedSyncTimer = () => {
  clearTimeout(syncTimerId);
  syncTimerId = null;
}