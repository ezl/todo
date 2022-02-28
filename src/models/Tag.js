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
      toggled: this.attr(false),
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

  static async findOrCreateTags(names){
    const tags = [];

    for (let index = 0; index <  names.length; index++) {
      const name = names[index];

      let tag = this.query()
        .where('name', names[index])
        .first();

      if (!tag) {
        tag = await this.add(name);
      }

      tags.push(tag);
    }

    return tags;
  }
}
