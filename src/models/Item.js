import BaseModel from './BaseModel';
import Tag from './Tag';
import ItemTag from './ItemTag';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import Setting from './Setting';

export default class Item extends BaseModel {
  static entity = 'items';

  static fields() {
    return {
      id: this.attr(null),
      body: this.attr(''),
      completed_at: this.attr(null),
      created_at: this.attr(null),
      order: this.attr(null),
      tags_meta: this.attr(null),
      tags: this.belongsToMany(Tag, ItemTag, 'item_id', 'tag_id')
    };
  }

  static async restore() {
    let items = await LocalStorageHelper.getItems();
    const setting = Setting.query().first();

    if (setting.completed_preference == 'strikethrough_until_refresh') {
      // exclude items that were marked as completed
      items = items.filter(item => item.completed_at === null);
    }

    this.insert({
      data: [...items]
    });
  }

  static async add(body, completed) {
    if (body === undefined || completed === undefined) {
      throw '"body" and "completed" are required';
    }

    if (typeof completed !== 'boolean') {
      throw '"completed" must be a boolean';
    }

    if (typeof body !== 'string') {
      throw '"body" must be a string';
    }

    if (body === '') {
      throw '"body" cannot be empty';
    }

    const setting = Setting.query().first();

    // By default it will be placed at the top (position 1)
    // 0 is a temporary (waiting) position, it'll be pushed to position 1 when the items get re-ordered (in the next few lines)
    let newItemOrder = 0;

    if (setting.new_item_placement === 'bottom') {
      const bottomMostItem = Item.query()
        .orderBy('order', 'desc')
        .first();
      if (bottomMostItem) newItemOrder = bottomMostItem.order + 1;
    }

    const item = new this();
    item.body = body;
    item.completed_at = completed ? moment.utc().valueOf() : null;
    item.created_at = moment.utc().valueOf();
    item.order = newItemOrder;
    item.id = uuidv4();

    await item.$save();

    // Re-arrange items positions/orders if an item is to be placed at the bottom (position 1),
    // move the new item from temp position 0 to 1, then move up the item that was at position 1 to 2 and so on

    if (newItemOrder === 0) {
      await this.updateOrders();
    }

    return item;
  }

  static async updateOrders() {
    const items = Item.query()
      .orderBy('order', 'asc')
      .get();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      item.order = index + 1;
      await item.$save();
    }
  }

  // First checks if an attached tag is present in the list item body,
  // and removes/detaches said tag from this item if no reference was found within its body
  async detachRemovedTags() {
    const currentAttachedTags = Tag.query()
      .whereHas('items', query => query.where('id', this.id))
      .get();

    const body = this.body.toLowerCase().trim();
    for (let index = 0; index < currentAttachedTags.length; index++) {
      const tag = currentAttachedTags[index];
      const tagName = tag.name.toLowerCase().trim();

      const endsWithIt = body.endsWith(tagName);

      let removed;

      if (endsWithIt) {
        removed = !body.includes(tagName);
      } else {
        removed = !body.includes(tagName + ' ');
      }

      if (removed) {
        const relations = ItemTag.query()
          .where('item_id', this.id)
          .where('tag_id', tag.id)
          .get();

        relations.forEach(relation => relation.$delete());

        this.tags_meta = this.tags_meta.filter(meta => {
          if (meta.tag.toLowerCase().trim() != tag.name.toLowerCase().trim()) {
            return true;
          }

          return false;
        });

        await this.$save();
      }
    }
  }

  async assignSelectedTags(selectedTags) {
    if (selectedTags.length === 0) return;

    const uniqueTags = [];
    selectedTags.forEach(tagInfo => {
      const duplicate = uniqueTags.some(tag => tag.id === tagInfo.tag.id);
      if (!duplicate) uniqueTags.push(tagInfo.tag);
    });

    await Item.insertOrUpdate({
      data: {
        id: this.id,
        tags: uniqueTags
      }
    });
    await this.$save();
  }

  // Keeps tracks of start and end positions of the attached tags in the list item body.
  // This will be used to highlight them within the body
  async updateTagPositionsInBody() {
    let tags = this.tags;

    if (tags.length === 0) {
      tags = Tag.query()
        .whereHas('items', query => {
          return query.where('id', this.id);
        })
        .get();

      if (tags.length === 0) return;
    }

    let newTagPositions = [];

    for (let index = 0; index < tags.length; index++) {
      const tag = tags[index];
      const positions = this.findTagPositionInBody(tag.name);

      newTagPositions = [...newTagPositions, ...positions];
    }

    this.tags_meta = newTagPositions;

    await this.$save();
  }

  // Looks through the list item body and finds all occurrences of the provided tag.
  // It then returns an array containing start/end positions for all the occurrences of this tag
  findTagPositionInBody(tagName) {
    const positions = [];
    let searchStartOffset = 0;

    while (true) {
      const body = this.body.substring(searchStartOffset);

      const tagPosition = {
        tag: tagName
      };

      const startIndex = body.indexOf(tagName);

      if (startIndex === -1) {
        break;
      }

      tagPosition.startIndex = searchStartOffset + body.indexOf(tagName);
      tagPosition.endIndex = tagPosition.startIndex + tagPosition.tag.length;

      searchStartOffset = tagPosition.endIndex;

      positions.push(tagPosition);
    }

    return positions;
  }

  set completed(completed) {
    this.completed_at = completed ? moment.utc().valueOf() : null;
  }

  get completed() {
    return this.completed_at ? true : false;
  }
}
