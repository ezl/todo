import Tag from '../../models/Tag';

export const handleTagCreation = async remoteChangeLog => {
  await Tag.add(remoteChangeLog.meta.name, false, {
    created_at: remoteChangeLog.changed_at,
    uuid: remoteChangeLog.entity_uuid
  });
};

export const handleTagDeletion = async remoteChangeLog => {
  const tag = Tag.find(remoteChangeLog.entity_uuid);

  if(tag){
    await tag.$delete()
  }
};
