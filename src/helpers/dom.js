export const findParent = (node, callback) => {
    if (node == null) return null
    if (node.parentNode== null) return null
    if (node.tagName == 'BODY') return node
  
    if (callback(node.parentNode)) {
      return node.parentNode;
    } else {
      return findParent(node.parentNode, callback);
    }
  }