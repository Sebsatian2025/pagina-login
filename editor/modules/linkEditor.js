// public/editor/modules/linkEditor.js
import { saveEdit } from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeLink(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  const url = prompt("Pega la nueva URL:", el.href);
  if (!url) {
    hideMenu();
    return;
  }

  el.href = url;
  hideMenu();

  const selector = getSelector(el);
  saveEdit(uid, selector, "href", url)
    .then(() => console.log("✔️ Link guardado:", selector, url))
    .catch(err => console.error("❌ Error guardando link:", err));
}

