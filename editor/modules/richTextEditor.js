// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

const OVERRIDES_ID = "rich-text-editor-overrides";

// Inyecta la hoja de estilos de override una sola vez
function injectOverrides() {
  if (document.getElementById(OVERRIDES_ID)) return;
  const style = document.createElement("style");
  style.id = OVERRIDES_ID;
  style.textContent = `
    /* toolbar general */
    .rich-toolbar {
      background-color: rgba(0,0,0,0.85) !important;
      color:            #fff              !important;
    }

    /* botones dentro del toolbar */
    .rich-toolbar button {
      color:            #fff !important;
      background:       none !important;
      border:           none !important;
      cursor:           pointer !important;
      padding:          4px    !important;
      font-size:        14px   !important;
      line-height:      1      !important;
    }

    /* color picker */
    .rich-toolbar input[type=color] {
      width:        24px    !important;
      height:       24px    !important;
      border:       none    !important;
      padding:      0       !important;
      margin-left:  4px     !important;
      cursor:       pointer !important;
    }
  `;
  document.head.appendChild(style);
}

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  // 1) Inyecta overrides CSS
  injectOverrides();

  // 2) Activa edición en el elemento y fócalo
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();
  console.log("▶️ EditorRichText ACTIVADO");

  // 3) Busca el menú contextual (.ctx-menu) que ya es fixed
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) {
    console.error("❌ No se encontró .ctx-menu");
    return;
  }

  // 4) Si hubiera un toolbar previo, lo elimino
  const prev = menuEl.querySelector(".rich-toolbar");
  if (prev) prev.remove();

  // 5) Construyo el toolbar como hijo de .ctx-menu
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:  "absolute",
    bottom:    "100%",                          // encima del botón
    left:      "50%",                           // centrado
    transform: "translateX(-50%) translateY(-8px)", // 8px de margen
    display:   "flex",
    gap:       "6px",
    padding:   "6px 8px",
    borderRadius: "4px",
    zIndex:    "1001"
  });

  // 6) Evito que clic en toolbar haga blur en el editable
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 7) Helper para crear un botón formateador
  const makeBtn = (cmd, inner) => {
    const b = document.createElement("button");
    b.dataset.cmd = cmd;
    b.innerHTML   = inner;
    b.addEventListener("mousedown", e => {
      e.preventDefault();
      document.execCommand(cmd, false, null);
    });
    return b;
  };

  // 8) Añadir controles
  tb.appendChild(makeBtn("bold",        "<b>B</b>"));
  tb.appendChild(makeBtn("italic",      "<i>I</i>"));
  tb.appendChild(makeBtn("underline",   "<u>U</u>"));
  tb.appendChild(makeBtn("strikeThrough","<s>S</s>"));

  const colorInput = document.createElement("input");
  colorInput.type   = "color";
  colorInput.dataset.cmd = "foreColor";
  colorInput.addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
  });
  colorInput.addEventListener("mousedown", e => e.preventDefault());
  tb.appendChild(colorInput);

  // 9) Incrusto el toolbar en el menú
  menuEl.appendChild(tb);
  console.log("✅ Toolbar inyectado (con overrides CSS)");

  // 10) Al perder foco, guardo y limpio
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();   // cierra .ctx-menu
    tb.remove();  // quita el toolbar

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
