import BaseModel from './BaseModel';
import Item from './Item';
import ItemTag from './ItemTag';
import Setting from './Setting';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import ChangeLogger from '../sync/ChangeLogger';
import { TAG_COLORS } from '@/constants';

export default class Tag extends BaseModel {
  static get entity() {
    return 'tags';
  }

  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(''),
      created_at: this.attr(null),
      toggled: this.attr(false),
      color: this.attr(null),
      order: this.attr(null),
      items: this.belongsToMany(Item, ItemTag, 'tag_id', 'item_id')
    };
  }

  static async add(name, sync, options) {
    if (name === undefined) {
      throw 'Name of the tag is required';
    }

    if (sync === undefined) sync = true;
    if (options === undefined) options = {};

    const tag = new this();
    tag.name = name;
    tag.created_at = options.created_at ? options.created_at : moment.utc().format();
    tag.id = options.uuid ? options.uuid : uuidv4();

    if (options != undefined && options.color) {
      tag.color = options.color;
    } else {
      // Pick a random color
      const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
      tag.color = TAG_COLORS[randomIndex].hexValue;
    }

    await tag.$save();

    if (sync) ChangeLogger.tagCreated(tag);

    return tag;
  }

  static async findOrCreateTags(names) {
    const tags = [];

    for (let index = 0; index < names.length; index++) {
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

  // Returns tags in user preferred order
  static orderTags(tags) {

    if(typeof tags === 'undefined'){
      console.error('[tags] param is required')
      return
    }

    if(!Array.isArray(tags)){
      console.error('[tags] must be am array. Got', typeof tags)
      return
    }

    const settings = Setting.query().first();

    tags = tags.sort((a, b) => {
      if (settings.sort_tags_by === 'alphabetical_order') return a.name.localeCompare(b.name);

      if (settings.sort_tags_by === 'usage_frequency') return b.items.length - a.items.length;

      if (settings.sort_tags_by === 'custom_order') return a.order - b.order;

      if (settings.sort_tags_by === 'oldest') {
        const d1 = new Date(a.created_at);
        const d2 = new Date(b.created_at);

        return d1.getTime() - d2.getTime();
      }
    });

    return tags;
  }
}
