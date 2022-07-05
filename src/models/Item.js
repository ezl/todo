import BaseModel from './BaseModel';
import Tag from './Tag';
import ItemTag from './ItemTag';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import Setting from './Setting';
import ChangeLogger from '../sync/ChangeLogger';

export default class Item extends BaseModel {
  
  static get entity () {
    return 'items'
  }

  static fields() {
    return {
      id: this.attr(null),
      body: this.attr(''),
      completed_at: this.attr(null),
      created_at: this.attr(null),
      order: this.attr(null),
      tag_positions: this.attr(null),
      discarded_at: this.attr(null),
      snoozed_until: this.attr(null),
      tags: this.belongsToMany(Tag, ItemTag, 'item_id', 'tag_id')
    };
  }

  static async restore() {
    let items = await LocalStorageHelper.getItems();
    
    this.insert({
      data: [...items]
    });
  }

  static async add(body, completed, shouldSync, options) {
    if(shouldSync === undefined) shouldSync = true

    if (body === undefined || completed === undefined && options.completed_at === undefined) {
      throw '"body" and "completed" are required';
    }

    if (typeof completed !== 'boolean' && options.completed_at === undefined) {
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
    item.completed_at = completed ? moment.utc().format() : null;
    item.created_at = moment.utc().format();
    item.order = newItemOrder;
    item.id = uuidv4();

    if(options != undefined && typeof options === 'object'){
      if(options.completed_at != undefined) item.completed_at = options.completed_at
      if(options.created_at != undefined) item.created_at = options.created_at
      if(options.order != undefined) item.order = options.order
      if(options.uuid != undefined) item.id = options.uuid
    }    

    await item.$save();

    if(shouldSync){
      await ChangeLogger.itemCreated(item)
    }

    // Re-arrange items positions/orders if an item is to be placed at the bottom (0) (position 1),
    // move the new item from temp position 0 to 1, then move up the item that was at position 1 to 2 and so on
    // We first have to make sure we have not been given an explicit position 
    if (newItemOrder === 0 && options === undefined) {
      await this.updateOrders();
    }

    return item;
  }

  static async updateOrders() {
    const items = Item.query()
      .orderBy('order', 'asc')
      .get();

    const newOrders = {}

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const newOrder = index + 1
      
      item.order = newOrder;
      item.$save();

      newOrders[item.id] = newOrder
    }

    await ChangeLogger.itemOrdersChanged(newOrders)
  }

  // First checks if an attached tag is present in the list item body,
  // and removes/detaches said tag from this item if no reference was found within its body
  // We’ll set sync to false when we call this function while applying/merging changes from other devices 
  // We don’t want to push changes when we call this during merging
  async detachRemovedTags(shouldSync) {
    if(shouldSync === undefined) shouldSync = true

    let currentAttachedTags = Tag.query()
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

        if(!this.tag_positions) continue

        this.tag_positions = this.tag_positions.filter(meta => {
          if (meta.tag.toLowerCase().trim() != tag.name.toLowerCase().trim()) {
            return true;
          }

          return false;
        });

        await this.$save();
      }
    }

    if(shouldSync){
      const currentAttachedTagIds = Tag.query()
        .whereHas('items', query => query.where('id', this.id))
        .get()
        .map(t => t.id)
  
      ChangeLogger.itemAttachedTagsChanged(this.id, currentAttachedTagIds);
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

    ChangeLogger.itemAttachedTagsChanged(this.id, uniqueTags.map(t => t.id));
  }

  // Keeps tracks of start and end positions of the attached tags in the list item body.
  // This will be used to highlight them within the body
  async updateTagPositionsInBody(shouldSync) {
    if(shouldSync === undefined) shouldSync = true

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

    this.tag_positions = newTagPositions;

    await this.$save();
    if(shouldSync) await ChangeLogger.itemPropertyValueChanged(this.id, 'tag_positions', this.tag_positions)
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

  async discard(){
    this.discarded_at = moment.utc().format()
    await this.$save()
    await ChangeLogger.itemPropertyValueChanged(this.id, 'discarded_at', this.discarded_at);
  }
  
  async snooze(days){
    if(typeof days === 'undefined'){
      console.error('[days] param is required in order to snooze an item')
      return
    }

    const date = moment.utc().add(days, 'days').format()

    this.snoozed_until = date

    console.log(`snoozing ${this.body} for ${days}, until ${date}`)

    await this.$save()
    await ChangeLogger.itemPropertyValueChanged(this.id, 'snoozed_until', this.snoozed_until);
  }

  async unsnooze(){
    this.snoozed_until = null;

    await this.$save()
    await ChangeLogger.itemPropertyValueChanged(this.id, 'snoozed_until', this.snoozed_until);
  }

  set completed(completed) {
    this.completed_at = completed ? moment.utc().format() : null;
  }

  get completed() {
    return this.completed_at ? true : false;
  }

  get snoozed() {
    const now =  moment.utc()
    const snoozeEndDate = moment.utc(this.snoozed_until)

    return now.isBefore(snoozeEndDate)

  }
}
