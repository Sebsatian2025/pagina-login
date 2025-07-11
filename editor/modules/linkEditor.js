// public/editor/modules/linkEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeLink(ctxMenu, uid, pageId, hideMenu) {
  const a = ctxMenu.target;
  const url = prompt("Nueva URL:", a.href);
  if (!url) {
    return hideMenu();
  }
  a.href = url;
  const selector = getSelector(a);
  saveEdit(uid, pageId, selector, "href", url).finally(hideMenu);
}
