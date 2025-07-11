// public/editor/modules/bgImageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeBgImage(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;

  // 1) Crear selector de archivos
  const chooser = document.createElement("input");
  chooser.type   = "file";
  chooser.accept = "image/*";
  chooser.style.display = "none";
  document.body.appendChild(chooser);

  // 2) Cuando selecciones archivo
  chooser.onchange = () => {
    const file = chooser.files[0];
    if (!file) {
      chooser.remove();
      return hideMenu();
    }
    const reader = new FileReader();
    reader.onload = async e => {
      el.style.backgroundImage = `url(${e.target.result})`;
      el.style.backgroundSize  = "cover";
      el.style.backgroundPosition = "center";

      // 3) Guardar estilo modificado
      const selector = getSelector(el);
      try {
        await saveEdit(uid, selector, "style.backgroundImage", e.target.result);
        console.log("✔️ Fondo actualizado:", selector);
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
