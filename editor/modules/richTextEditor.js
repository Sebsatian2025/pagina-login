// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO (Inline Bubble)");

  // 1) Crear toolbar
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position: "fixed",
    zIndex:   "10001",
    background:"#fff",
    padding:  "6px",
    boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
    borderRadius:"4px"
  });
  document.body.appendChild(tb);

  // 2) Rellenar botones
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" style="width:24px;height:24px;border:none;" />
  `;

  // 3) Función para recalcular posición sobre scroll/resize
  function updatePosition() {
    const rect = el.getBoundingClientRect();
    // margen de 8px
    let top  = rect.top - tb.offsetHeight - 8;
    if (top < 0) top = rect.bottom + 8;
    let left = rect.left + rect.width/2 - tb.offsetWidth/2;
    if (left < 8) left = 8;
    if (left + tb.offsetWidth > window.innerWidth - 8) {
      left = window.innerWidth - tb.offsetWidth - 8;
    }
    tb.style.top  = `${top}px`;
    tb.style.left = `${left}px`;
  }

  // 4) Prevenir blur al interactuar con el toolbar
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 5) Asignar comandos en mousedown
  tb.querySelectorAll("[data-cmd]").forEach(ctrl => {
    ctrl.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = ctrl.dataset.cmd;
      const val = ctrl.tagName === "INPUT" ? ctrl.value : null;
      document.execCommand(cmd, false, val);
    });
  });

  // 6) Monitorear scroll y resize
  updatePosition();
  window.addEventListener("scroll", updatePosition, { passive: true });
  window.addEventListener("resize", updatePosition);

  // 7) Al blur guardamos y limpiamos
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();
    window.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", updatePosition);
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
