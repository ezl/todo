import store from '@/store';

store.subscribe(mutation => {
  switch (mutation.type) {
    case 'items/SET_ITEMS':
      onItemsUpdated(mutation.payload);
      break;
    case 'items/ADD_ITEM':
      onItemAdded(mutation.payload.item);
      break;
    case 'items/UPDATE_ITEM':
      onItemUpdated(mutation.payload);
      break;
    case 'items/DELETE_ITEM':
      onItemDeleted(mutation.payload);
      break;
    case 'settings/SET_SETTINGS':
      onSettingsUpdated(mutation.payload);
      break;
    default:
      break;
  }
});

const onItemsUpdated = async items => {
  // We need to convert items to a normal object before saving
  items = JSON.parse(JSON.stringify(items));
  browser.storage.local.set({ items });
};

const onItemAdded = async item => {
  // "item" is currently a reactive object
  // We must convert it back to a normal object before saving
  item = JSON.parse(JSON.stringify(item));

  const { items } = await browser.storage.local.get({ items: [] });
  items.push(item);

  await browser.storage.local.set({ items });
};

const onItemUpdated = async ({ id, updatedProperties }) => {
  const { items } = await browser.storage.local.get({ items: [] });

  let index;
  let item = items.find((item, i) => {
    if (item.id === id) {
      index = i;
      return true;
    }

    return false;
  });

  if (item === undefined) {
    return;
  }

  item = { ...item, ...updatedProperties };

  items.splice(index, 1, item);
  await browser.storage.local.set({ items });
};

const onSettingsUpdated = settings => {
  // make sure to convert it to a normal object
  settings = JSON.parse(JSON.stringify(settings));
  browser.storage.local.set({ settings });
};

const onItemDeleted = async id => {
  let { items } = await browser.storage.local.get({ items: [] });

  items = items.filter(item => item.id !== id);

  browser.storage.local.set({ items });
};
