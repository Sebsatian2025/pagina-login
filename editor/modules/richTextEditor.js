import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

let injected = false;
function injectOverrides() {
  if (injected) return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `
    .rich-toolbar { background: rgba(0,0,0,0.85) !important; color: #fff !important; }
    .rich-toolbar button { background: none !important; border: none !important; color: #fff !important; cursor: pointer; padding: 4px; }
    .rich-toolbar input[type=color] { width:24px;height:24px;border:none;padding:0;margin-left:4px;cursor:pointer; }
  `;
  document.head.appendChild(style);
}

/**
 * sizesMap: Map<selector, { maxLines: number, lineHeight: number }>
 */
export function onChangeRichText(
  ctxMenu, uid, pageId, hideMenu, sizesMap
) {
  injectOverrides();

  const el       = ctxMenu.target;
  const prevHtml = el.innerHTML;
  el.contentEditable = true;
  el.focus();

  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) return;

  const oldTb = menuEl.querySelector(".rich-toolbar");
  if (oldTb) oldTb.remove();

  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:      "absolute",
    bottom:        "100%",
    left:          "50%",
    transform:     "translateX(-50%) translateY(-8px)",
    display:       "flex",
    gap:           "6px",
    padding:       "6px 8px",
    borderRadius:  "4px",
    zIndex:        "1001"
  });
  tb.addEventListener("mousedown", e => e.preventDefault());

  const makeBtn = (cmd, html) => {
    const b = document.createElement("button");
    b.dataset.cmd = cmd;
    b.innerHTML   = html;
    b.addEventListener("mousedown", e => {
      e.preventDefault();
      document.execCommand(cmd, false, null);
    });
    return b;
  };
  tb.append(makeBtn("bold","<b>B</b>"));
  tb.append(makeBtn("italic","<i>I</i>"));
  tb.append(makeBtn("underline","<u>U</u>"));
  tb.append(makeBtn("strikeThrough","<s>S</s>"));

  const colorInput = document.createElement("input");
  colorInput.type        = "color";
  colorInput.dataset.cmd = "foreColor";
  colorInput.addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
  });
  colorInput.addEventListener("mousedown", e => e.preventDefault());
  tb.appendChild(colorInput);

  menuEl.appendChild(tb);

  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();
    tb.remove();

    const selector = getSelector(el);
    const newHtml  = el.innerHTML;

    // Validar líneas
    const cfg = sizesMap.get(selector);
    if (cfg) {
      const newHeight = el.getBoundingClientRect().height;
      const newLines  = Math.round(newHeight / cfg.lineHeight);
      if (newLines > cfg.maxLines) {
        alert(
          `Tu texto ocupa ${newLines} líneas (máx ${cfg.maxLines}). ` +
          `Recorta el contenido o haz párrafos más cortos.`
        );
        el.innerHTML = prevHtml;
        return;
      }
    }

    try {
      await saveEdit(uid, pageId, selector, "html", newHtml);
      console.log("✔️ Texto guardado:", selector);
    } catch(err) {
      console.error("❌ Error guardando texto:", err);
      el.innerHTML = prevHtml;
    }
  };
}
