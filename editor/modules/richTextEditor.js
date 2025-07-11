// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  console.log("▶️ EditorRichText ACTIVADO");
  console.log("📍 Posición del toolbar:", ctxMenu.x, ctxMenu.y);

  // 1. Crear toolbar (posición fija de prueba para debug)
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  tb.style.position = "absolute";
  tb.style.left = "300px";        // ← posición fija
  tb.style.top  = "150px";        // ← posición fija

  // Estilos de debug visual
  tb.style.background = "lime";
  tb.style.outline    = "2px dashed red";
  tb.style.padding    = "8px";
  tb.style.zIndex     = "9999";

  tb.innerHTML += `<div style="margin-bottom:6px;">🧪 Toolbar activo</div>`;

  // 2. Botones esenciales
  tb.innerHTML += `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="underline"><u>U</u></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
    <input type="color" data-cmd="foreColor" title="Color" style="width:28px; padding:0; border:none;" />
  `;

  document.body.appendChild(tb);
  console.log("✅ Toolbar inyectado");

  // 3. Ejecutar comandos
  tb.querySelectorAll("[data-cmd]").forEach(control => {
    control.addEventListener("click", e => {
      e.preventDefault();
      const cmd  = control.dataset.cmd;
      const val  = control.tagName === "INPUT" ? control.value : null;
      document.execCommand(cmd, false, val);
    });
    if (control.tagName === "INPUT") {
      control.addEventListener("input", e => {
        const cmd = e.target.dataset.cmd;
        document.execCommand(cmd, false, e.target.value);
      });
    }
  });

  // 4. Guardar edición al perder foco
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
