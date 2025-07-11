// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  // 1) Activa edición en el elemento
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  // 2) Localiza el menú contextual (el botón “Editar texto”)
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) {
    console.error("❌ No se encontró .ctx-menu");
    return;
  }

  // 3) Construye el contenedor del toolbar
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:      "absolute",
    bottom:        "100%",                           // justo encima
    left:          "50%",                            // centrado
    transform:     "translateX(-50%) translateY(-8px)", // 8px de separación
    background:    "rgba(0, 0, 0, 0.85)",             // fondo oscuro semi-trans
    borderRadius:  "4px",
    padding:       "6px 8px",
    display:       "flex",
    alignItems:    "center",
    gap:           "6px",
    zIndex:        "1001"
  });

  // Evita que el click en el toolbar haga blur en el elemento editable
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 4) Helper para crear botones con estilo
  const makeButton = (cmd, innerHTML) => {
    const btn = document.createElement("button");
    btn.dataset.cmd = cmd;
    btn.innerHTML = innerHTML;
    Object.assign(btn.style, {
      background: "none",
      border:     "none",
      color:      "#fff",
      cursor:     "pointer",
      fontSize:   "14px",
      padding:    "4px",
      lineHeight: "1"
    });
    btn.addEventListener("mousedown", e => {
      e.preventDefault();
      document.execCommand(cmd, false, null);
    });
    return btn;
  };

  // 5) Añade los controles
  tb.appendChild(makeButton("bold",        "<b>B</b>"));
  tb.appendChild(makeButton("italic",      "<i>I</i>"));
  tb.appendChild(makeButton("underline",   "<u>U</u>"));
  tb.appendChild(makeButton("strikeThrough","<s>S</s>"));

  // Color picker
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.dataset.cmd = "foreColor";
  Object.assign(colorInput.style, {
    width:      "24px",
    height:     "24px",
    border:     "none",
    padding:    "0",
    cursor:     "pointer"
  });
  // aplica color al input
  colorInput.addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
  });
  colorInput.addEventListener("mousedown", e => e.preventDefault());
  tb.appendChild(colorInput);

  // 6) Incrústalo dentro de .ctx-menu para que siga el scroll
  menuEl.appendChild(tb);

  // 7) Al perder foco, guarda y limpia
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();  // oculta el .ctx-menu
    tb.remove(); // quita el toolbar

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
