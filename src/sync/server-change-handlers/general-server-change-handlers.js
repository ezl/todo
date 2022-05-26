import { ENTYTY_TYPE_ITEM, ENTYTY_TYPE_TAG } from '../entity-types';
import Item from '@/models/Item';
import Tag from '@/models/Tag';
import LocalStorageHelper from '@/helpers/LocalStorageHelper';

export const getChangeTargetEntity = (changeLog) => {
    switch (changeLog.entity_type) {
        case ENTYTY_TYPE_ITEM:
            return Item.find(changeLog.entity_uuid);
        case ENTYTY_TYPE_TAG:
            return Tag.find(changeLog.entity_uuid);
        default:
          break;
      }
}

export const handleEntityPropertyValueChange = async remoteChangeLog => {
    const changeLogs = await LocalStorageHelper.getValue({ changeLogs: [] });
  
    const shouldNotApply = changeLogs.find(change => {
      const targetsSameEntity = change.entity_type == remoteChangeLog.entity_type && change.entity_uuid == remoteChangeLog.entity_uuid;
      const targetsSameProperty = change.meta.property_pame == remoteChangeLog.meta.property_pame;
      const happendAfterRemoteChange = change.changed_at > remoteChangeLog.changed_at;
      if (targetsSameEntity && targetsSameProperty && happendAfterRemoteChange) {
        return true;
      }
    });
  
    if (shouldNotApply) return;
  
    const model = getChangeTargetEntity(remoteChangeLog);
  
    if (!model) return;
  
    model[remoteChangeLog.meta.property_pame] = remoteChangeLog.meta.new_value;
  
    await model.$save();
    
    if(remoteChangeLog.entity_type == ENTYTY_TYPE_ITEM){
        await model.detachRemovedTags(false);
        await model.updateTagPositionsInBody(false);
    }
  };

export const handleEntityDeletion = async remoteChangeLog => {
    const entity = getChangeTargetEntity(remoteChangeLog);
  
    if (entity) {
      await entity.$delete();
    }
  };