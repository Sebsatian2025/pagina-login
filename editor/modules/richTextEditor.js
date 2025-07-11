// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");

  // 1) Obtener rect del texto o selección
  const sel  = window.getSelection();
  const rect = sel.rangeCount
    ? sel.getRangeAt(0).getBoundingClientRect()
    : el.getBoundingClientRect();

  // 2) Crear toolbar
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:  "fixed",
    zIndex:    "10001",
    background:"#fff",
    padding:   "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  });

  // 3) Calcular posición con margen 8px
  let top  = rect.top - tb.offsetHeight - 8;
  if (top < 0) top = rect.bottom + 8;   // si no cabe arriba, cae abajo
  const left = rect.left + rect.width/2 - (tb.offsetWidth/2);

  tb.style.top  = `${top}px`;
  tb.style.left = `${left}px`;

  // 4) Prevenir blur al clicar en toolbar
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 5) Botones de formato
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" style="width:24px;height:24px;border:none;" />
  `;
  document.body.appendChild(tb);
  console.log("✅ Toolbar inyectado (Inline Bubble)");

  // 6) Ejecutar comandos
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = control.dataset.cmd;
      const val = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
  });

  // 7) Guardar al blur
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
