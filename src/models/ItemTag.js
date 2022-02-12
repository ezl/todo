import { Model } from '@vuex-orm/core';

export default class ItemTag extends Model {
  static entity = 'item_tag';

  static primaryKey = ['item_id', 'tag_id'];

  static fields() {
    return {
      item_id: this.attr(null),
      tag_id: this.attr(null)
    };
  }
}
