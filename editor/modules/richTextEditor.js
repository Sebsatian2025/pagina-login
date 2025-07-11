// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  // 1) buscamos el menú contextual (el botón “Editar texto”)
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) {
    console.error("No se encontró .ctx-menu");
    return;
  }
  const menuRect = menuEl.getBoundingClientRect();

  console.log("▶️ Inline Bubble ACTIVADO sobre botón");

  // 2) creamos la burbuja
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:   "fixed",
    zIndex:     "10002",
    background: "#fff",
    padding:    "6px",
    boxShadow:  "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius:"4px",
    // la colocamos justo encima del botón:
    top:        `${menuRect.top - 8}px`,             // 8px de margen
    left:       `${menuRect.left + menuRect.width/2}px`,
    transform:  "translate(-50%, -100%)"
  });

  // 3) evitar blur al interactuar con el toolbar
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 4) botones de formato
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor"
           style="width:24px;height:24px;border:none;padding:0;" />
  `;
  document.body.appendChild(tb);

  // 5) aplicar comando en mousedown
  tb.querySelectorAll("[data-cmd]").forEach(ctrl => {
    ctrl.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = ctrl.dataset.cmd;
      const val = ctrl.tagName === "INPUT" ? ctrl.value : null;
      document.execCommand(cmd, false, val);
    });
  });

  // 6) al perder foco guardamos y quitamos la burbuja
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();
    tb.remove();

    const selector = getSelector(el);
    const html     = el.innerHTML;
    try {
      await saveEdit(uid, selector, "html", html);
      console.log("✔️ Guardado HTML:", selector);
    } catch(err) {
      console.error("❌ Error guardando:", err);
    }
  };
}
