// public/editor/modules/richTextEditor.js
import { saveEdit }   from "./firestore.js";
import { getSelector } from "./utils.js";

export function onChangeRichText(ctxMenu, uid, hideMenu) {
  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  // 1) Crear toolbar flotante
  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  const { x, y } = ctxMenu;
  tb.style.left = `${x}px`;
  tb.style.top  = `${y - 10}px`;

  tb.innerHTML = `
    <button data-cmd="bold"><b>B</b></button>
    <button data-cmd="italic"><i>I</i></button>
    <button data-cmd="strikeThrough"><s>S</s></button>
  `;
  document.body.appendChild(tb);

  // 2) Conectar botones a execCommand
  tb.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
    });
  });

  // 3) Cleanup + guardar al blur
  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();
    tb.remove();

    const selector = getSelector(el);
    const html     = el.innerHTML;
    try {
      await saveEdit(uid, selector, "html", html);
      console.log("✔️ HTML guardado:", selector);
    } catch(err) {
      console.error("❌ Error guardando HTML:", err);
    }
  };
}
