import BaseModel from './BaseModel';
import Item from './Item';
import ItemUser from './ItemUser';
import Tag from './Tag';

export default class User extends BaseModel {

  static get entity () {
    return 'users'
  }

  static fields() {
    return {
      id: this.attr(null),
      email: this.attr(null),
      missing_info: this.attr(false),
      items: this.belongsToMany(Item, ItemUser, 'user_id', 'item_id'),
      tags: this.hasMany(Tag, 'user_id'),
      item_user_pivot: this.hasMany(ItemUser, 'user_id'),
    };
  }
}
