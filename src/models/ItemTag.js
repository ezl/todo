import BaseModel from './BaseModel';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

export default class ItemTag extends BaseModel {

  static get entity () {
    return 'item_tag'
  }

  static get primaryKey () {
    return ['item_id', 'tag_id'];
  }

  static fields() {
    return {
      item_id: this.attr(null),
      tag_id: this.attr(null)
    };
  }

  static async restore() {
    let data = await LocalStorageHelper.getItemTagRelationships()

    this.insert({
      data
    });
  }
}
