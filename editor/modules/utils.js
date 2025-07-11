// public/editor/modules/utils.js

/**
 * Genera un selector único simplificado para un elemento.
 * Si tiene id → usa #id, sino tagName:nth-child().
 */
export function getSelector(el) {
  if (el.id) return `#${el.id}`;
  const tag   = el.tagName.toLowerCase();
  const parent = el.parentElement;
  const idx   = Array.from(parent.children).indexOf(el) + 1;
  return `${tag}:nth-child(${idx})`;
}
