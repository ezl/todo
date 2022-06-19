export const findParent = (node, callback) => {
  if (node == null) return null;
  if (node.parentNode == null) return null;
  if (node.tagName == 'BODY') return node;

  if (callback(node.parentNode)) {
    return node.parentNode;
  } else {
    return findParent(node.parentNode, callback);
  }
};

export const setTheme = theme => {
  if (theme === 'dark') {
    document.body.classList.remove('bg-white');
    document.body.classList.add('dark');
    document.body.classList.add('bg-eerie-black');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.remove('bg-eerie-black');
    document.body.classList.add('bg-white');
  }
};
