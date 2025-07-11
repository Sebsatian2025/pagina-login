// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");

  // 1. Crear toolbar y posicionarlo en el centro-bajo (fixed)
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:   "fixed",
    left:       "50%",      // centro horizontal
    top:        "60%",      // 60% desde arriba (ajusta este valor al gusto)
    transform:  "translate(-50%, -50%)",
    background: "#fff",
    padding:    "8px",
    boxShadow:  "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius:"4px",
    zIndex:     "10001"
  });

  // 2. Evitar blur cuando hacemos clic dentro del toolbar
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 3. Botones de formato
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" title="Color"
           style="width:24px;height:24px;border:none;padding:0;margin-left:8px;" />
  `;

  document.body.appendChild(tb);
  console.log("✅ Toolbar inyectado en centro-bajo");

  // 4. Aplicar comandos sin perder foco
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = control.dataset.cmd;
      const val = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
    if (control.tagName === "INPUT") {
      control.addEventListener("input", e => {
        document.execCommand(control.dataset.cmd, false, e.target.value);
      });
    }
  });

  // 5. Al perder foco guardamos y quitamos el toolbar
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
