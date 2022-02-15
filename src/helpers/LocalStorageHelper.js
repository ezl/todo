import Item from '../models/Item';
import Setting from '../models/Setting';
import ItemTag from '../models/ItemTag';
import Tag from '../models/Tag';

export default class LocalStorageHelper {
  static async restore() {
    await Setting.restore();
    await Tag.restore();
    await Item.restore();
    await ItemTag.restore();
  }

  static async getItems() {
    let { items } = await browser.storage.local.get({ items: [] });

    return items;
  }

  static async getTags() {
    let { tags } = await browser.storage.local.get({ tags: [] });

    return tags;
  }

  static async getItemTagRelationships() {
    let { itemTagRelationships } = await browser.storage.local.get({ itemTagRelationships: [] });

    return itemTagRelationships;
  }

  static async getSettings() {
    let { settings } = await browser.storage.local.get({ settings: {} });

    return settings;
  }

  static update(entity) {
    switch (entity) {
      case 'items':
        this.updateItems();
        break;
      case 'tags':
        this.updateTags();
        break;
      case 'item_tag':
        this.updateItemTagRelationships();
        break;
      case 'settings':
        this.updateSettings();
        break;
      default:
        break;
    }
  }

  static async updateItems() {
    const items = Item.all();

    const json = [];
    items.forEach(item => {
      json.push(item.$toJson());
    });

    await browser.storage.local.set({
      items: json
    });
  }

  static async updateTags() {
    const tags = Tag.all();

    const json = [];
    tags.forEach(tag => {
      json.push(tag.$toJson());
    });

    await browser.storage.local.set({
      tags: json
    });
  }

  static async updateSettings() {
    const setting = Setting.query().first();

    const json = setting.$toJson();

    await browser.storage.local.set({
      settings: json
    });
  }

  static async updateItemTagRelationships() {
    const itemTagRelationships = ItemTag.all();

    const json = [];
    itemTagRelationships.forEach(itemTagRelationship => {
      json.push(itemTagRelationship.$toJson());
    });

    await browser.storage.local.set({
      itemTagRelationships: json
    });
  }
}
