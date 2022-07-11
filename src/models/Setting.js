import BaseModel from './BaseModel';
import { v4 as uuidv4 } from 'uuid';

export default class Setting extends BaseModel {

  static get entity () {
    return 'settings'
  }

  static fields() {
    return {
      id: this.attr(uuidv4()),
      new_item_placement: this.attr('top'),
      theme: this.attr('dark'),
      completed_preference: this.attr('strikethrough_until_refresh'),
      sort_tags_by: this.attr('alphabetical_order'),
      hide_tags_without_items: this.attr(true),
      show_only_items_matching_all_selected_tags: this.attr(false),
      display_number_of_items_per_tag: this.attr(true),
      show_unfinished_tasks_count: this.attr(true),
    };
  }

  static retrieve(){
    return this.query().first();
  }
}
