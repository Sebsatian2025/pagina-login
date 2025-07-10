// public/editor/modules/textEditor.js
import { saveEdit } from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();

    const selector = getSelector(el);
    const newText  = el.innerText.trim();

    try {
      await saveEdit(uid, selector, "text", newText);
      console.log("✔️ Texto guardado:", selector, newText);
    } catch (err) {
      console.error("❌ Error guardando texto:", err);
    }
  };
}

