// public/editor/modules/imageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeImage(ctxMenu, uid, hideMenu) {
  const img = ctxMenu.target;

  // 1) Crear input[file]
  const chooser = document.createElement("input");
  chooser.type   = "file";
  chooser.accept = "image/*";
  chooser.style.display = "none";
  document.body.appendChild(chooser);

  // 2) Al seleccionar archivo, leerlo y actualizar
  chooser.onchange = () => {
    const file = chooser.files[0];
    if (!file) {
      chooser.remove();
      return hideMenu();
    }
    const reader = new FileReader();
    reader.onload = async e => {
      img.src = e.target.result;
      img.style.width     = "100%";
      img.style.height    = "auto";
      img.style.objectFit = "cover";

      // Guardar edit en Firestore
      const selector = getSelector(img);
      try {
        await saveEdit(uid, selector, "src", e.target.result);
        console.log("✔️ Imagen actualizada:", selector);
      } catch(err) {
        console.error("❌ Error guardando imagen:", err);
      }
    };
    reader.readAsDataURL(file);

    hideMenu();
    chooser.remove();
  };

  // 3) Disparar diálogo
  chooser.click();
}
