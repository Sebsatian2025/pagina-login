// public/editor/modules/richTextEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

let injected = false;
function injectOverrides() {
  if (injected) return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `
    .rich-toolbar {
      background: rgba(0,0,0,0.85) !important;
      color:      #fff              !important;
    }
    .rich-toolbar button {
      background: none    !important;
      border:     none    !important;
      color:      #fff    !important;
      cursor:     pointer !important;
      padding:    4px     !important;
      font-size:  14px    !important;
    }
    .rich-toolbar input[type=color] {
      width:       24px !important;
      height:      24px !important;
      border:      none !important;
      padding:     0    !important;
      margin-left: 4px  !important;
      cursor:      pointer !important;
    }
  `;
  document.head.appendChild(style);
}

export function onChangeRichText(ctxMenu, uid, pageId, hideMenu) {
  injectOverrides();

  const el = ctxMenu.target;
  el.contentEditable = true;
  el.focus();

  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) return;

  const prev = menuEl.querySelector(".rich-toolbar");
  if (prev) prev.remove();

  const tb = document.createElement("div");
  tb.className = "rich-toolbar";
  Object.assign(tb.style, {
    position:  "absolute",
    bottom:    "100%",
    left:      "50%",
    transform: "translateX(-50%) translateY(-8px)",
    display:   "flex",
    gap:       "6px",
    padding:   "6px 8px",
    borderRadius: "4px",
    zIndex:    "1001"
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

  tb.appendChild(makeBtn("bold",        "<b>B</b>"));
  tb.appendChild(makeBtn("italic",      "<i>I</i>"));
  tb.appendChild(makeBtn("underline",   "<u>U</u>"));
  tb.appendChild(makeBtn("strikeThrough","<s>S</s>"));

  const inputColor = document.createElement("input");
  inputColor.type        = "color";
  inputColor.dataset.cmd = "foreColor";
  inputColor.addEventListener("input", e => {
    document.execCommand("foreColor", false, e.target.value);
  });
  inputColor.addEventListener("mousedown", e => e.preventDefault());
  tb.appendChild(inputColor);

  menuEl.appendChild(tb);

  el.onblur = async () => {
    el.contentEditable = false;
    hideMenu();
    tb.remove();
    const selector = getSelector(el);
    const html     = el.innerHTML;
    await saveEdit(uid, pageId, selector, "html", html);
  };
}
