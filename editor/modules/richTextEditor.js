// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");

  // 1) Localiza el menú contextual (botón “Editar texto”)
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) {
    console.error("❌ No se encontró .ctx-menu");
    return;
  }
  const menuRect = menuEl.getBoundingClientRect();

  // 2) Crea el toolbar como hijo de .ctx-menu
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";

  // 3) Posición absoluta encima del botón
  Object.assign(tb.style, {
    position:      "absolute",
    bottom:        "100%",                       // justo encima
    left:          "50%",                        // centrado horizontal
    transform:     "translateX(-50%) translateY(-8px)", // +8px margen
    background:    "#333",                       // fondo oscuro
    color:         "#fff",                       // texto claro
    padding:       "6px 8px",
    boxShadow:     "0 2px 8px rgba(0,0,0,0.3)",
    borderRadius:  "4px",
    display:       "flex",
    gap:           "6px",
    zIndex:        "1001"
  });

  // 4) Prevenir que click en toolbar haga blur en el editable
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 5) Inserta los botones y el input de color
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" title="Color" />
  `;
  menuEl.appendChild(tb);
  console.log("✅ Toolbar inyectado dentro de .ctx-menu");

  // 6) Ajusta el estilo de botones e input para que sean visibles
  tb.querySelectorAll("button").forEach(btn => {
    Object.assign(btn.style, {
      background: "none",
      border:     "none",
      color:      "#fff",
      cursor:     "pointer",
      fontSize:   "14px",
      padding:    "4px"
    });
  });
  const colorInput = tb.querySelector("input[type=color]");
  Object.assign(colorInput.style, {
    width:       "24px",
    height:      "24px",
    border:      "none",
    padding:     "0",
    cursor:      "pointer"
  });

  // 7) Ejecuta cada comando en mousedown para mantener el foco
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = control.dataset.cmd;
      const val = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
  });

  // 8) Al perder foco, guarda y remueve el toolbar
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
