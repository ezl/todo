import Setting from '../models/Setting';
import store from '../store';
import { isRunningAsAnExtension } from './extension';

let storage = {};
let initializedStore = false;
let storageCommitTimerId = null;

export default class LocalStorageHelper {
  static async init() {
    storage = await this.getAllStorageItems();

    let settings = Setting.query().first();
    
    if (!settings) {
      const defaultSetting = new Setting();
      const entities = await Setting.insert({
        data: defaultSetting
      });

      settings = entities.settings[0];
    }

    const oldStore = await this.getValue({ store: null });

    if (oldStore) {
      store.commit('initialiseStore', oldStore);
    }

    initializedStore = true;
  }

  static async getAllStorageItems() {
    let items = {};

    if (isRunningAsAnExtension()) {
      items = await browser.storage.local.get(null);
    } else {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage[key];

          if (value) items[key] = JSON.parse(value);
        }
      }
    }

    return items;
  }

  static async commit() {
    try {
      for (const key in storage) {
        if (!storage.hasOwnProperty(key)) continue;
        const value = storage[key];

        if (isRunningAsAnExtension()) {
          const obj = {};
          obj[key] = value;
          await browser.storage.local.set(obj);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error(error);
    }

    clearTimeout(storageCommitTimerId);
    storageCommitTimerId = null;
  }

  static scheduleCommit() {
    if (storageCommitTimerId) {
      return;
    }

    storageCommitTimerId = setTimeout(this.commit, 1000);
  }

  static async setValue(value) {
    if (typeof value !== 'object') {
      throw '"value" must be an object';
    }

    const key = Object.keys(value)[0];

    storage[key] = value[key];

    this.scheduleCommit();
  }

  static async getValue(value) {
    if (typeof value !== 'object') {
      throw '"value" must be an object';
    }

    const key = Object.keys(value)[0];
    const defaultValue = value[key];

    if (storage.hasOwnProperty(key)) {
      return storage[key];
    }

    storage[key] = defaultValue;

    this.scheduleCommit();

    return defaultValue;
  }

  static isStoreInitialized() {
    return initializedStore;
  }
}
