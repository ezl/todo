import Setting from '@/models/Setting';

const changeListeners = [];

export const onSettingsUpdated = cb => {
  changeListeners.push(cb);
};

export const setNewSettingValues = async newValues => {
  const settings = Setting.retrieve();

  await Setting.update({
    where: settings.id,
    data: {
      ...newValues
    }
  });

  // notify subscribers
  changeListeners.forEach(cb => cb(newValues));
};
