import { ENTYTY_TYPE_ITEM, ENTYTY_TYPE_TAG } from '../entity-types';
import { CHANGE_TYPE_PROPERTY_VALUE_CHANGE, CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE, CHANGE_TYPE_CREATION, CHANGE_TYPE_DELETION } from '../change-types';
import { handleItemCreation, handleItemPropertyValueChange, handleItemAttachedTagsChange, handleItemDeletion } from './item-server-change-handlers';
import { handleTagCreation, handleTagDeletion } from './tag-server-change-handlers';

export const handleServerChanges = async remoteChanges => {
  for (let index = 0; index < remoteChanges.length; index++) {
    const change = remoteChanges[index];
    if (change.entity_type == ENTYTY_TYPE_ITEM) await handleItemRelatedServerChanges(change);
    if (change.entity_type == ENTYTY_TYPE_TAG) await handleTagRelatedServerChanges(change);
  }
};

const handleItemRelatedServerChanges = async changeLog => {
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

const handleTagRelatedServerChanges = async changeLog => {
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
