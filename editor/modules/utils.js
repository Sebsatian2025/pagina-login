export function getSelector(el) {
  if (el.id) return `#${el.id}`;
  const tag   = el.tagName.toLowerCase();
  const parent = el.parentElement;
  const idx   = Array.from(parent.children).indexOf(el) + 1;
  return `${tag}:nth-child(${idx})`;
}
