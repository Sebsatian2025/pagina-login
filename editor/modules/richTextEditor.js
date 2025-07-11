// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");

  // 1) Encuentra el menú contextual (el botón “Editar texto”)
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) {
    console.error("❌ No se encontró .ctx-menu");
    return;
  }

  // 2) Crea el toolbar como hijo de .ctx-menu
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";

  // 3) Posición absoluta sobre el botón
  Object.assign(tb.style, {
    position:      "absolute",
    bottom:        "100%",                      // justo encima
    left:          "50%",                       // centrado horizontal
    transform:     "translateX(-50%) translateY(-8px)",  // margen de 8px
    background:    "#fff",
    padding:       "6px",
    boxShadow:     "0 2px 8px rgba(0,0,0,0.15)",
    borderRadius:  "4px",
    zIndex:        "1001"
  });

  // 4) Evita que un click en el toolbar haga blur en el elemento editable
  tb.addEventListener("mousedown", e => e.preventDefault());

  // 5) Botones de formato
  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor"
           title="Color"
           style="width:24px;height:24px;border:none;padding:0;margin-left:4px;" />
  `;

  // 6) Agrégalo dentro del menuEl, para que viaje con él al hacer scroll
  menuEl.appendChild(tb);
  console.log("✅ Toolbar inyectado dentro de .ctx-menu");

  // 7) Ejecuta los comandos en mousedown para conservar foco
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("mousedown", e => {
      e.preventDefault();
      const cmd = control.dataset.cmd;
      const val = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
    if (control.tagName === "INPUT") {
      control.addEventListener("input", e => {
        document.execCommand(cmd, false, e.target.value);
      });
    }
  });

  // 8) Al perder foco, guarda los cambios y limpia el toolbar
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();        // oculta el menú contextual
    tb.remove();       // quita el toolbar

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
