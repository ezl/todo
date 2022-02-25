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
    let items = await this.getValue({ items: []})

    return items;
  }

  static async getTags() {
    let tags = await this.getValue({ tags: [] });

    return tags;
  }

  static async getItemTagRelationships() {
    let itemTagRelationships = await this.getValue({ itemTagRelationships: [] });

    return itemTagRelationships;
  }

  static async getSettings() {
    let settings  = await this.getValue({ settings: {} });

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

    await this.setValue({
      items: json
    });
  }

  static async updateTags() {
    const tags = Tag.all();

    const json = [];
    tags.forEach(tag => {
      json.push(tag.$toJson());
    });

    await this.setValue({
      tags: json
    });
  }

  static async updateSettings() {
    const setting = Setting.query().first();

    const json = setting.$toJson();

    await this.setValue({
      settings: json
    });
  }

  static async updateItemTagRelationships() {
    const itemTagRelationships = ItemTag.all();

    const json = [];
    itemTagRelationships.forEach(itemTagRelationship => {
      json.push(itemTagRelationship.$toJson());
    });

    await this.setValue({
      itemTagRelationships: json
    });
  }

  static async setValue(value){
    if(typeof value !== 'object'){
      throw '"value" must be an object'
    }

    if(typeof browser !== 'undefined' && browser.storage){
      await browser.storage.local.set(value);
    }else{
      const key = Object.keys(value)[0]

      localStorage.setItem(key, JSON.stringify(value[key]));
    }
  }

  static async getValue(value){
    if(typeof value !== 'object'){
      throw '"value" must be an object'
    }

    const key = Object.keys(value)[0]
    const defaultValue = value[key]

    if(typeof browser !== 'undefined' && browser.storage){
      const result = await browser.storage.local.get(value);

      return result[key]
    }else{
      const result = localStorage.getItem(key)

      if(result !== null) return JSON.parse(result)

      return defaultValue
    }
  }
}
