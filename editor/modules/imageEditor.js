// public/editor/modules/imageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeImage(ctxMenu, uid, pageId, hideMenu) {
  const img = ctxMenu.target;
  const chooser = document.createElement("input");
  chooser.type   = "file";
  chooser.accept = "image/*";
  chooser.style.display = "none";
  document.body.append(chooser);

  chooser.onchange = () => {
    const file = chooser.files[0];
    if (!file) {
      chooser.remove();
      return hideMenu();
    }
    const reader = new FileReader();
    reader.onload = async e => {
      img.src = e.target.result;
      img.style.width       = "100%";
      img.style.height      = "auto";
      img.style.objectFit   = "cover";

      const selector = getSelector(img);
      await saveEdit(uid, pageId, selector, "src", e.target.result);
    };
    reader.readAsDataURL(file);

    hideMenu();
    chooser.remove();
  };

  chooser.click();
}
