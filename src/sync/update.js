import LocalStorageHelper from '../helpers/LocalStorageHelper';
import moment from 'moment';
import axios from 'axios';
import store from '../store';
import Item from '../models/Item';
import Tag from '../models/Tag';
import ItemTag from '../models/ItemTag';
import { ENTYTY_TYPE_ITEM, ENTYTY_TYPE_TAG } from './entity-types';
import { CHANGE_TYPE_PROPERTY_VALUE_CHANGE, CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE, CHANGE_TYPE_CREATION, CHANGE_TYPE_DELETION } from './change-types';

store.subscribe(mutation => {
  switch (mutation.type) {
    case 'auth/SET_TOKEN':
      if (mutation.payload) {
        pullLatestChanges()
      }
      break;
    default:
      break;
  }
});

const pullLatestChanges = async () => {
  const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });
  const lastSyncedAt = await LocalStorageHelper.getValue({ lastSyncedAt: null });

  const latestLocalChangeLogs = changeLogs.filter(changeLog => changeLog.changed_at > lastSyncedAt);
  
  try {
    const response = await axios.post(`/sync/`, {
      last_synced_at: lastSyncedAt,
      change_logs: latestLocalChangeLogs
    });

    if (response.data.last_synced_at) {
      LocalStorageHelper.setValue({ lastSyncedAt: response.data.last_synced_at });
    } else {
      LocalStorageHelper.setValue({ lastSyncedAt: moment.utc().format() });
    }

    const latestRemoteChangeLogs = response.data.change_logs;
    handleNewRemoteChanges(latestRemoteChangeLogs);
  } catch (error) {
    console.error(error);
  }
};

const handleNewRemoteChanges = async remoteChanges => {
  for (let index = 0; index < remoteChanges.length; index++) {
    const change = remoteChanges[index];
    if (change.entity_type == ENTYTY_TYPE_ITEM) await applyRemoteItemChanges(change);
    if (change.entity_type == ENTYTY_TYPE_TAG) await applyRemoteTagChanges(change);
  }
};

const applyRemoteItemChanges = async changeLog => {
  switch (changeLog.change_type) {
    case CHANGE_TYPE_CREATION:
      await handleItemCreation(changeLog);
      break;
    case CHANGE_TYPE_PROPERTY_VALUE_CHANGE:
      await handleItemPropertyValueChange(changeLog);
      break;
    case CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE:
      await handleItemAttachedTagsChange(changeLog);
      break;
    case CHANGE_TYPE_DELETION:
      await handleItemDeletion(changeLog);
      break;

    default:
      break;
  }
};

const applyRemoteTagChanges = async changeLog => {
  switch (changeLog.change_type) {
    case CHANGE_TYPE_CREATION:
      await handleTagCreation(changeLog);
      break;
    case CHANGE_TYPE_DELETION:
      await handleTagDeletion(changeLog);
      break;

    default:
      break;
  }
};

const handleItemCreation = async remoteChangeLog => {
  let item = await Item.add(remoteChangeLog.meta.body, null, false, {
    uuid: remoteChangeLog.entity_uuid,
    created_at: remoteChangeLog.meta.created_at,
    completed_at: remoteChangeLog.meta.completed_at,
    order: remoteChangeLog.meta.order
  });
};

const handleItemPropertyValueChange = async remoteChangeLog => {
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

  if (!item)  return

  item[remoteChangeLog.meta.property_pame] = remoteChangeLog.meta.new_value;

  await item.$save();
  await item.detachRemovedTags(false);
  await item.updateTagPositionsInBody(false);
};

const handleItemAttachedTagsChange = async remoteChangeLog => {
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

const handleItemDeletion = async remoteChangeLog => {
  const item = Item.find(remoteChangeLog.entity_uuid);

  if(item){
    await item.$delete()
  }
};

const handleTagCreation = async remoteChangeLog => {
  let t = await Tag.add(remoteChangeLog.meta.name, false, {
    created_at: remoteChangeLog.changed_at,
    uuid: remoteChangeLog.entity_uuid
  });
};

const handleTagDeletion = async remoteChangeLog => {
  const tag = Tag.find(remoteChangeLog.entity_uuid);

  if(tag){
    await tag.$delete()
  }
};
