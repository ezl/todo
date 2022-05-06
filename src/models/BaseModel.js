import { Model } from '@vuex-orm/core';
import LocalStorageHelper from '../helpers/LocalStorageHelper';
import ChangeLogger from '../sync/ChangeLogger';

export default class BaseModel extends Model {
  static afterCreate(model) {
    LocalStorageHelper.update(this.entity);
  }

  static afterUpdate(model) {
    LocalStorageHelper.update(this.entity);
  }

  static afterDelete(model) {
    LocalStorageHelper.update(this.entity);

    if(this.entity == 'items')(
      ChangeLogger.entityDeleted('item', model.id)
    )

    if(this.entity == 'tags')(
      ChangeLogger.entityDeleted('tag', model.id)
    )
  }
}
