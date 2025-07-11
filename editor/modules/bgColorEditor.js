// public/editor/modules/bgColorEditor.js
import { saveEdit }    from "./firestore.js";
import { getSelector } from "./utils.js";

// 1. Define tu paleta de swatches
const PALETA = [
  "#FFFFFF", // blanco
  "#F8F9FA", // gris claro
  "#E9ECEF",
  "#DEE2E6",
  "#CED4DA",
  "#ADB5BD",
  "#6C757D",
  "#495057", // gris oscuro
  "#343A40",
  "#212529",
  "#0D6EFD", // primary
  "#6610F2", // secondary
  "#198754", // success
  "#DC3545", // danger
];

// 2. Función para contraste (WCAG 2.0)
function contrastRatio(hex1, hex2) {
  const toL = hex => {
    const c = parseInt(hex.slice(1),16);
    const r = (c >> 16)/255, g = ((c>>8)&0xff)/255, b = (c&0xff)/255;
    const f = x => x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4);
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  };
  const L1 = toL(hex1), L2 = toL(hex2);
  return (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
}

export function onChangeBgColor(ctxMenu, uid, pageId, hideMenu) {
  const el = ctxMenu.target;
  const menuEl = document.querySelector(".ctx-menu");
  if (!menuEl) return;

  // Limpia editor anterior
  const existing = menuEl.querySelector(".bg-color-editor");
  if (existing) existing.remove();

  // Crea contenedor de swatches
  const panel = document.createElement("div");
  panel.className = "bg-color-editor";
  Object.assign(panel.style, {
    display:     "grid",
    gridTemplateColumns: "repeat(5, 28px)",
    gap:         "4px",
    padding:     "8px",
    marginTop:   "4px",
    background:  "#fff",
    border:      "1px solid #ccc",
    borderRadius:"4px",
    zIndex:      "1002"
  });

  // Texto actual y color de texto calculado
  const texto = el.textContent.trim();
  const colorTexto = getComputedStyle(el).color.match(/\d+/g)
                   .slice(0,3).map(n=>+n).map(x=>x.toString(16).padStart(2,"0")).join("");
  const fgHex = "#" + colorTexto;

  // Agrega cada swatch
  PALETA.forEach(color => {
    const btn = document.createElement("button");
    btn.title = color;
    Object.assign(btn.style, {
      width:      "24px",
      height:     "24px",
      background: color,
      border:     "1px solid #999",
      cursor:     "pointer"
    });

    // Indica si el contraste es insuficiente
    const ratio = contrastRatio(color, fgHex);
    if (ratio < 4.5) {
      btn.style.opacity = "0.4";
      btn.disabled = true;
      btn.title += " (contraste insuficiente)";
    }

    btn.addEventListener("click", async () => {
      el.style.backgroundColor = color;
      const selector = getSelector(el);
      try {
        await saveEdit(uid, pageId, selector, "style.backgroundColor", color);
        console.log("✔️ Fondo de color guardado:", selector);
      } catch(err) {
        console.error("❌ Error guardando color:", err);
      }
      hideMenu();
    });

    panel.appendChild(btn);
  });

  menuEl.appendChild(panel);
}
