// public/editor/modules/imageEditor.js
import { saveEdit } from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeImage(ctxMenu, uid, hideMenu) {
  const el  = ctxMenu.target;
  const inp = document.createElement("input");
  inp.type  = "file";
  inp.accept= "image/*";

  inp.onchange = () => {
    const file = inp.files[0];
    if (!file) {
      hideMenu();
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      el.src = reader.result;
      hideMenu();

      const selector = getSelector(el);
      try {
        await saveEdit(uid, selector, "src", reader.result);
        console.log("✔️ Imagen guardada:", selector);
      } catch (err) {
        console.error("❌ Error guardando imagen:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  inp.click();
}

