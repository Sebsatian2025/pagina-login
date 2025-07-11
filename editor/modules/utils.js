// public/editor/modules/utils.js

/**
 * Obtiene el valor de un parámetro en la URL actual.
 * Ejemplo: ?htmlUrl=foo.html&uid=123 → getParam("htmlUrl") === "foo.html"
 */
export function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Genera un selector único para un elemento:
 * - Si tiene id: "#id"
 * - Si no, "tagname:nth-child(idx)"
 */
export function getSelector(el) {
  if (el.id) {
    return `#${el.id}`;
  }
  const tag    = el.tagName.toLowerCase();
  const parent = el.parentElement;
  const idx    = Array.from(parent.children).indexOf(el) + 1;
  return `${tag}:nth-child(${idx})`;
}
