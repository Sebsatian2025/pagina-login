// public/editor/modules/utils.js
export function getParam(name) {
  const p = new URLSearchParams(window.location.search).get(name);
  return p ? decodeURIComponent(p) : "";
}

export function getSelector(el) {
  if (el.id) return `#${el.id}`;
  const idx = Array.prototype.indexOf.call(el.parentNode.children, el) + 1;
  return `${el.tagName.toLowerCase()}:nth-child(${idx})`;
}

