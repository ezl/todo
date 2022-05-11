import Item from '../../models/Item';
import Tag from '../../models/Tag';
import ItemTag from '../../models/ItemTag';
import { ENTYTY_TYPE_ITEM } from '../entity-types';
import LocalStorageHelper from '../../helpers/LocalStorageHelper';


export const handleItemCreation = async remoteChangeLog => {
  await Item.add(remoteChangeLog.meta.body, null, false, {
    uuid: remoteChangeLog.entity_uuid,
    created_at: remoteChangeLog.meta.created_at,
    completed_at: remoteChangeLog.meta.completed_at,
    order: remoteChangeLog.meta.order
  });
};

export const handleItemPropertyValueChange = async remoteChangeLog => {
  const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });

  const shouldNotApply = changeLogs.find(change => {
    const targetsSameEntity = change.entity_type == ENTYTY_TYPE_ITEM && change.entity_uuid == remoteChangeLog.entity_uuid;
    const targetsSameProperty = change.meta.property_pame == remoteChangeLog.meta.property_pame;
    const happendAfterRemoteChange = change.changed_at > remoteChangeLog.changed_at;
    if (targetsSameEntity && targetsSameProperty && happendAfterRemoteChange) {
      return true;
    }
  });

  if (shouldNotApply) return;

  const item = Item.find(remoteChangeLog.entity_uuid);

  if (!item) return;

  item[remoteChangeLog.meta.property_pame] = remoteChangeLog.meta.new_value;

  await item.$save();
  await item.detachRemovedTags(false);
  await item.updateTagPositionsInBody(false);
};

export const handleItemAttachedTagsChange = async remoteChangeLog => {
  const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });

  // Get latest corresponding local change
  const shouldNotApply = changeLogs.some(change => {
    const targetsSameEntity = change.entity_type == ENTYTY_TYPE_ITEM && change.entity_uuid == remoteChangeLog.entity_uuid;
    const happendAfterRemoteChange = change.changed_at > remoteChangeLog.changed_at;
    if (targetsSameEntity && happendAfterRemoteChange) {
      return true;
    }
  });

  if (shouldNotApply) {
    return;
  }

  const item = Item.find(remoteChangeLog.entity_uuid);
  const tags = Tag.query()
    .whereIdIn(remoteChangeLog.meta.current_attached_tags_uuids)
    .get();

  // remove current attached tags
  const relations = ItemTag.query()
    .where('item_id', remoteChangeLog.entity_uuid)
    .get();
  relations.forEach(relation => relation.$delete());

  tags.forEach(tag => {
    item;
  });

  await Item.insertOrUpdate({
    data: {
      id: remoteChangeLog.entity_uuid,
      tags
    }
  });

  await item.updateTagPositionsInBody(false);
};

export const handleItemDeletion = async remoteChangeLog => {
  const item = Item.find(remoteChangeLog.entity_uuid);

  if (item) {
    await item.$delete();
  }
};
