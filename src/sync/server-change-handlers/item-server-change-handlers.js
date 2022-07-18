import User from '@/models/User';
import Item from '@/models/Item';
import Tag from '@/models/Tag';
import ItemTag from '@/models/ItemTag';
import ItemUser from '@/models/ItemUser';
import { ENTYTY_TYPE_ITEM } from '../entity-types';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';
import auth from '@/helpers/auth';


export const handleItemCreation = async remoteChangeLog => {
  await Item.add(remoteChangeLog.meta.body, null, false, {
    uuid: remoteChangeLog.entity_uuid,
    created_at: remoteChangeLog.meta.created_at,
    completed_at: remoteChangeLog.meta.completed_at,
    order: remoteChangeLog.meta.order
  });
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

export const handleItemUserAssignment = async remoteChangeLog => {
  const email = remoteChangeLog.meta.assigned_user_email

  let item = Item.find(remoteChangeLog.entity_uuid)
  const user = User.query().where('email', email).first()

  if(!item){
    console.log('assigned task does not exist... created now')
    const options = remoteChangeLog.meta.item
    if(user){
      options.userId = user.id
      options.isAssigned = true
      options.isOwner = false
    }
    console.log('ops: ', options)
    item = await Item.add(remoteChangeLog.meta.item.body, null, false, options);
  }

  // Make sure we don’t assign a user twice to the same item
  const isAlreadyAssigned = User.query().where('email', email).whereHas('items', (query) => {
    query.where('id', remoteChangeLog.entity_uuid)
  }).exists()

  console.log('isAlreadyAssigned: ', isAlreadyAssigned)
  if(!isAlreadyAssigned){
    await item.assignSelectedUsers([user || email], false)
  }
}

export const handleItemUserAssignmentResponse = async remoteChangeLog => {

  
  const item = Item.find(remoteChangeLog.entity_uuid);
  const user = User.query().where('email', remoteChangeLog.meta.user.email).with('items').first()
  
  if(!item || !user) return

  const newId = remoteChangeLog.meta.user.id

  const itemUserRelations = ItemUser.query().where('user_id', user.id).get();
  for (let index = 0; index < itemUserRelations.length; index++) {
    const relation = itemUserRelations[index];

    if(user.missing_info) relation.user_id = newId

    if(relation.item_id == item.id){
      relation.invitation_accepted_at = remoteChangeLog.changed_at
    }

    await relation.$save()
  }

  if(user.missing_info){
    const oldLocalId = user.id

    user.id = newId
    user.missing_info = false
    console.log(user.email+' was missing info')
    await user.$save()

    const oldInstance = User.query().where('id', oldLocalId).first()
    console.log('oldInstance ', oldInstance)
    await oldInstance.$delete()
  }else{
    console.log('no missing info for ', user.email)
  }
}