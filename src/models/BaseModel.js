import { Model } from '@vuex-orm/core';
import LocalStorageHelper from '../helpers/LocalStorageHelper';

export default class BaseModel extends Model {
  static afterCreate(model) {
    LocalStorageHelper.update(this.entity);
  }

  static afterUpdate(model) {
    LocalStorageHelper.update(this.entity);
  }

  static afterDelete(model) {
    LocalStorageHelper.update(this.entity);
  }
}
