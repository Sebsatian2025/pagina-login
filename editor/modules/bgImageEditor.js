// public/editor/modules/bgImageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeBgImage(ctxMenu, uid, pageId, hideMenu) {
  const el = ctxMenu.target;
  const chooser = document.createElement("input");
  chooser.type   = "file";
  chooser.accept = "image/*";
  chooser.style.display = "none";
  document.body.appendChild(chooser);

  chooser.onchange = () => {
    const file = chooser.files[0];
    if (!file) {
      chooser.remove();
      hideMenu();
      return;
    }
    const reader = new FileReader();
    reader.onload = async e => {
      el.style.backgroundImage    = `url(${e.target.result})`;
      el.style.backgroundSize     = "cover";
      el.style.backgroundPosition = "center";

      const selector = getSelector(el);
      try {
        await saveEdit(uid, pageId, selector, "style.backgroundImage", e.target.result);
        console.log("✔️ Fondo guardado:", selector);
      } catch(err) {
        console.error("❌ Error guardando fondo:", err);
      }
    };
    reader.readAsDataURL(file);

    hideMenu();
    chooser.remove();
  };

  chooser.click();
}
