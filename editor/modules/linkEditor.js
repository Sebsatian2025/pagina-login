// public/editor/modules/linkEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeLink(ctxMenu, uid, pageId, hideMenu) {
  const a   = ctxMenu.target;
  const url = prompt("Nueva URL:", a.href);
  if (!url) {
    hideMenu();
    return;
  }
  a.href = url;
  const selector = getSelector(a);

  saveEdit(uid, pageId, selector, "href", url)
    .then(() => console.log("✔️ Link guardado:", selector))
    .catch(err => console.error("❌ Error guardando link:", err))
    .finally(hideMenu);
}
