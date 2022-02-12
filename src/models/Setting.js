import LocalStorageHelper from '../helpers/LocalStorageHelper';
import BaseModel from './BaseModel';
import { v4 as uuidv4 } from 'uuid';

export default class Setting extends BaseModel {
  static entity = 'settings';

  static fields() {
    return {
      id: this.attr(uuidv4()),
      new_item_placement: this.attr('top'),
      theme: this.attr('dark'),
      completed_preference: this.attr('strikethrough_until_refresh')
    };
  }

  static async fetch() {
    const settings = await LocalStorageHelper.getSettings();
    let entities

    if (Object.keys(settings).length === 0) {
      const defaultSetting = new this();
      entities = await this.insert({
        data: defaultSetting
      });
    } else {
      entities = await this.insert({
        data: settings
      });
    }

    return entities.settings[0]
  }
}
