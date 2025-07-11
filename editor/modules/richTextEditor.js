// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  // Creamos el toolbar
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";

  // Lo fijamos también al viewport
  tb.style.position = "fixed";
  tb.style.left     = `${ctxMenu.x}px`;
  tb.style.top      = `${ctxMenu.y + 24}px`; // 24px abajo del botón

  // Evitar que el click en el toolbar haga blur en el elemento
  tb.addEventListener("mousedown", e => e.preventDefault());

  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" title="Color"
           style="width:24px;height:24px;border:none;padding:0;" />
  `;

  document.body.appendChild(tb);

  // Ejecutar comando sin perder focus
  tb.querySelectorAll("[data-cmd]").forEach(ctrl => {
    ctrl.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = ctrl.dataset.cmd;
      const val = ctrl.tagName === "INPUT" ? ctrl.value : null;
      document.execCommand(cmd, false, val);
    });
    if (ctrl.tagName === "INPUT") {
      ctrl.addEventListener("input", e => {
        document.execCommand(ctrl.dataset.cmd, false, e.target.value);
      });
    }
  });

  // Al blur guardamos y cerramos
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
