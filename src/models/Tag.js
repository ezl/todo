import BaseModel from './BaseModel';
import Item from './Item';
import ItemTag from './ItemTag';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

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

  static async add(name) {
    if (name === undefined) {
      throw 'Name of the tag is required';
    }

    const tag = new this();
    tag.name = name;
    tag.created_at = moment.utc().valueOf();
    tag.id = uuidv4();

    await tag.$save();

    return tag;
  }

  static async restore() {
    let tags = await LocalStorageHelper.getTags()

    this.insert({
      data: [...tags]
    });
  }
}
