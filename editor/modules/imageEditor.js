// public/editor/modules/imageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeImage(ctxMenu, uid, hideMenu) {
  const img = ctxMenu.target;

  // Crear input[type=file] para escoger imagen
  const chooser = document.createElement("input");
  chooser.type    = "file";
  chooser.accept  = "image/*";
  chooser.style.display = "none";
  document.body.appendChild(chooser);

  // Al seleccionar archivo, leerlo y actualizar src
  chooser.onchange = () => {
    const file = chooser.files[0];
    if (!file) {
      chooser.remove();
      hideMenu();
      return;
    }
    const reader = new FileReader();
    reader.onload = async e => {
      img.src = e.target.result;
      // Ajustar para no romper el layout
      img.style.width      = "100%";
      img.style.height     = "auto";
      img.style.objectFit  = "cover";

      // Guardar en Firestore
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

  // Disparar diálogo
  chooser.click();
}
