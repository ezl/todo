import Item from '../models/Item';
import Setting from '../models/Setting';

export default class LocalStorageHelper {
  static async getItems() {
    let { items } = await browser.storage.local.get({ items: [] });

    return items;
  }

  static async getSettings() {
    let { settings } = await browser.storage.local.get({ settings: {} });

    return settings;
  }

  static update(entity) {
    switch (entity) {
      case 'items':
        this.updateItemsAndTags();
        break;
      case 'settings':
        this.updateSettings();
        break;
      default:
        break;
    }
  }

  static async updateItemsAndTags() {
    const items = Item.query()
      .with('tags')
      .get();

    const json = [];
    items.forEach(item => {
      json.push(item.$toJson());
    });

    await browser.storage.local.set({
      items: json
    });
  }

  static async updateSettings() {
    const setting = Setting.query().first();

    const json = setting.$toJson();

    await browser.storage.local.set({
      settings: json
    });
  }
}
