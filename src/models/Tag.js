import BaseModel from './BaseModel';
import Item from './Item';
import ItemTag from './ItemTag';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

export default class Tag extends BaseModel {
  static entity = 'tags';

  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(''),
      created_at: this.attr(null),
      items: this.belongsToMany(Item, ItemTag, 'tag_id', 'item_id')
    };
  }

  static afterCreate(model) {
    LocalStorageHelper.updateItemsAndTags();
  }

  static afterUpdate(model) {
    LocalStorageHelper.updateItemsAndTags();
  }
}
