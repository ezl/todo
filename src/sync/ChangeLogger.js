import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import { ENTYTY_TYPE_ITEM, ENTYTY_TYPE_TAG } from './entity-types';
import { 
  CHANGE_TYPE_PROPERTY_VALUE_CHANGE, 
  CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE, 
  CHANGE_TYPE_CREATION, 
  CHANGE_TYPE_DELETION, 
  CHANGE_TYPE_USER_ASSIGNMENT } from './change-types';
import { syncDelayed } from './index'

export default class ChangeLogger {
  static async createChange(change) {
    if (change.changed_at === undefined) change.changed_at = moment.utc().format();
    if (change.meta === undefined) change.meta = {}

    const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });
    changeLogs.push(change);
    await LocalStorageHelper.setValue({ changeLogs });
  }
  
  static async itemPropertyValueChanged(uuid, property_pame, new_value) {
    await this.entityPropertyValueChanged(ENTYTY_TYPE_ITEM, uuid, property_pame, new_value)
  }

  static async tagPropertyValueChanged(uuid, property_pame, new_value) {
    await this.entityPropertyValueChanged(ENTYTY_TYPE_TAG, uuid, property_pame, new_value)
  }

  static async entityPropertyValueChanged(entity_type, uuid, property_pame, new_value) {
    if (!entity_type || entity_type == '') {
      console.error('entity_type is required');
      return;
    }

    if (!uuid) {
      console.error('uuid is required');
      return;
    }

    if (!property_pame) {
      console.error('property_pame is required');
      return;
    }

    if (new_value === undefined) {
      console.error('new_value is required');
      return;
    }

    await this.createChange({
      entity_type: entity_type,
      entity_uuid: uuid,
      change_type: CHANGE_TYPE_PROPERTY_VALUE_CHANGE,
      meta: {
        property_pame,
        new_value
      },
    })

    syncDelayed()
  }

  static async itemAttachedTagsChanged(item_id, current_attached_tags_ids) {
    if (!item_id) {
      console.error('item_id is required');
      return;
    }

    if (!current_attached_tags_ids) {
      console.error('current_attached_tags_ids is required');
      return;
    }

    await this.createChange({
      entity_type: ENTYTY_TYPE_ITEM,
      entity_uuid: item_id,
      change_type: CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE,
      meta: {
        current_attached_tags_uuids: current_attached_tags_ids
      },
    })

    syncDelayed()
  }

  static async itemCreated(item) {
    if (!item) {
      console.error('item is required');
      return;
    }

    await this.createChange({
      entity_type: ENTYTY_TYPE_ITEM,
      entity_uuid: item.id,
      change_type: CHANGE_TYPE_CREATION,
      meta: {
        completed_at: item.completed_at,
        body: item.body,
        order: item.order,
        tag_positions: item.tag_positions,
        created_at: item.created_at
      },
    })

    syncDelayed()
  }

  static async itemOrdersChanged(newOrders) {
    const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });

    for (const uuid in newOrders) {
      const order = newOrders[uuid]

      const change = {
        entity_type: ENTYTY_TYPE_ITEM,
        entity_uuid: uuid,
        change_type: CHANGE_TYPE_PROPERTY_VALUE_CHANGE,
        meta: {
          property_pame: 'order',
          new_value: order
        },
        changed_at: moment.utc().format()
      }
      
      changeLogs.push(change);
    }

    await LocalStorageHelper.setValue({ changeLogs });

    syncDelayed()
  }

  static async userAssignedToItem(item, user) {
    if (!item) {
      console.error('item is required');
      return;
    }

    if (!user) {
      console.error('user is required');
      return;
    }

    await this.createChange({
      entity_type: ENTYTY_TYPE_ITEM,
      entity_uuid: item.id,
      change_type: CHANGE_TYPE_USER_ASSIGNMENT,
      meta: {
        assigned_user_email: user.email
      },
    })

    syncDelayed()
  }

  static async entityDeleted(entityType, entityId) {
    if (!entityType) {
      console.error('entityType is required');
      return;
    }

    if (!entityId) {
      console.error('entityId is required');
      return;
    }

    await this.createChange({
      entity_type: entityType,
      entity_uuid: entityId,
      change_type: CHANGE_TYPE_DELETION,
    })

    syncDelayed()
  }

  static async tagCreated(tag) {
    if (!tag) {
      console.error('tag is required');
      return;
    }

    await this.createChange({
      entity_type: ENTYTY_TYPE_TAG,
      entity_uuid: tag.id,
      change_type: CHANGE_TYPE_CREATION,
      meta: {
        name: tag.name,
        order: tag.order,
        color: tag.color,
        created_at: tag.created_at
      },
    })

    syncDelayed()
  }
}
