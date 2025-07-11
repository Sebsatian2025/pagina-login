// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");

  // Crear toolbar fijo arriba
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:   "fixed",
    top:        "0",
    left:       "0",
    right:      "0",
    background: "#fff",
    padding:    "8px 12px",
    boxShadow:  "0 2px 4px rgba(0,0,0,0.1)",
    zIndex:     "10001",
    display:    "flex",
    gap:        "8px"
  });

  // Evitar blur
  tb.addEventListener("mousedown", e => e.preventDefault());

  // Botones
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" />
    <button onclick="this.parentElement.remove()">Cerrar</button>
  `;

  document.body.appendChild(tb);
  console.log("✅ Toolbar inyectado (Sticky Top)");

  // Ejecutar comandos
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = control.dataset.cmd;
      const val = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
  });

  // Al perder foco
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
