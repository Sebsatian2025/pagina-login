// public/editor/modules/bgImageEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeBgImage(ctxMenu, uid, pageId, hideMenu) {
  const el = ctxMenu.target;
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
      el.style.backgroundImage    = `url(${e.target.result})`;
      el.style.backgroundSize     = "cover";
      el.style.backgroundPosition = "center";

      const selector = getSelector(el);
      await saveEdit(uid, pageId, selector, "style.backgroundImage", e.target.result);
    };
    reader.readAsDataURL(file);

    hideMenu();
    chooser.remove();
  };

  chooser.click();
}
