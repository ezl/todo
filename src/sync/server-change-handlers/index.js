import { ENTYTY_TYPE_ITEM, ENTYTY_TYPE_TAG } from '../entity-types';
import { 
  CHANGE_TYPE_PROPERTY_VALUE_CHANGE, 
  CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE, 
  CHANGE_TYPE_CREATION, 
  CHANGE_TYPE_DELETION,
  CHANGE_TYPE_USER_ASSIGNMENT,
  CHANGE_TYPE_USER_ASSIGNMENT_INVITATION_RESPONSE
} from '../change-types';
import { handleItemCreation, handleItemAttachedTagsChange, handleItemUserAssignment, handleItemUserAssignmentResponse } from './item-server-change-handlers';
import { handleTagCreation } from './tag-server-change-handlers';
import { handleEntityPropertyValueChange, handleEntityDeletion } from './general-server-change-handlers';

export const handleServerChanges = async remoteChanges => {
  for (let index = 0; index < remoteChanges.length; index++) {
    const change = remoteChanges[index];

    // General entity change
    await handleGeneralServerChanges(change)

    // For individual entity specified changes
    if (change.entity_type == ENTYTY_TYPE_ITEM) await handleItemRelatedServerChanges(change);
    if (change.entity_type == ENTYTY_TYPE_TAG) await handleTagRelatedServerChanges(change);
  }
};

const handleGeneralServerChanges = async changeLog => {
  switch (changeLog.change_type) {
    case CHANGE_TYPE_PROPERTY_VALUE_CHANGE:
      await handleEntityPropertyValueChange(changeLog);
      break;
    case CHANGE_TYPE_DELETION:
      await handleEntityDeletion(changeLog);
      break;
    default:
      break;
  }
};

const handleItemRelatedServerChanges = async changeLog => {
  switch (changeLog.change_type) {
    case CHANGE_TYPE_CREATION:
      await handleItemCreation(changeLog);
      break;
    case CHANGE_TYPE_ITEM_ATTACHED_TAGS_CHANGE:
      await handleItemAttachedTagsChange(changeLog);
      break;
    case CHANGE_TYPE_USER_ASSIGNMENT:
      await handleItemUserAssignment(changeLog);
      break;
    case CHANGE_TYPE_USER_ASSIGNMENT_INVITATION_RESPONSE:
      await handleItemUserAssignmentResponse(changeLog);
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
    default:
      break;
  }
};
