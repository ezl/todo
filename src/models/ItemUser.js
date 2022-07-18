import BaseModel from './BaseModel';

export default class ItemUser extends BaseModel {

  static get entity () {
    return 'item_user'
  }

  static get primaryKey () {
    return ['item_id', 'user_id'];
  }

  static fields() {
    return {
      item_id: this.attr(null),
      user_id: this.attr(null),
      is_owner: this.attr(null),
      is_assigned: this.attr(null),
      invitation_accepted_at: this.attr(null),
      invitation_rejected_at: this.attr(null),
    };
  }
}