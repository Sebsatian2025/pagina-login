// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                          from "https://esm.sh/react-dom@18.2.0";
import { loadEdits }                     from "./firestore.js";
import { onChangeRichText }              from "./richTextEditor.js";
import { onChangeImage }                 from "./imageEditor.js";
import { onChangeLink }                  from "./linkEditor.js";

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const [html, setHtml]   = useState("");
  const [edits, setEdits] = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show: false, x: 0, y: 0, type: null, target: null
  });

  // 1) Carga ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid).then(setEdits).catch(console.error);
  }, [uid]);

  // 2) Fetch + clonación de head
  useEffect(() => {
    if (!htmlUrl) return console.error("❌ Falta htmlUrl");
    fetch(htmlUrl)
      .then(r => r.text())
      .then(text => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // A) <base> para rutas
        const baseEl = document.createElement("base");
        baseEl.href  = origin + "/";
        document.head.insertBefore(baseEl, document.head.firstChild);

        // B) Clonar meta, link, style
        doc.head.querySelectorAll("meta, link[href], style").forEach(n => {
          const c = n.cloneNode(true);
          if (c.tagName === "LINK" && !c.href.startsWith("http")) {
            c.href = new URL(c.getAttribute("href"), origin).href;
          }
          document.head.append(c);
        });

        // C) Inyectar admin.css
        const adminCss = document.createElement("link");
        adminCss.rel  = "stylesheet";
        adminCss.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.append(adminCss);

        setHtml(doc.body.innerHTML);
      })
      .catch(console.error);
  }, [htmlUrl]);

  // 3) Inyectar body + aplicar edits + iconos de imagen
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // A) Aplicar ediciones
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.html) el.innerHTML = ch.html;
      if (ch.text) el.innerText  = ch.text;
      if (ch.href) el.href        = ch.href;
      if (ch.src)  el.src         = ch.src;
    });

    // B) Marcar tipos editables
    root.querySelectorAll("h1,h2,h3,p,span").forEach(el => {
      el.dataset.editableType = "text";
    });
    root.querySelectorAll("a").forEach(el => {
      el.dataset.editableType = "link";
    });

    // C) Imágenes: marcador + hint icon
    root.querySelectorAll("img").forEach(img => {
      img.dataset.editableType = "image";
      img.style.cursor = "pointer";

      // Asegurar contenedor relativo
      const parent = img.parentElement;
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      // Crear icono
      const icon = document.createElement("div");
      icon.className = "img-edit-icon";
      icon.innerText = "✎";
      Object.assign(icon.style, {
        position:   "absolute",
        top:        "8px",
        right:      "8px",
        background: "var(--bs-primary)",
        color:      "#fff",
        borderRadius: "50%",
        width:      "24px",
        height:     "24px",
        lineHeight: "24px",
        textAlign:  "center",
        fontSize:   "14px",
        cursor:     "pointer",
        display:    "none",
        zIndex:     "1001"
      });

      // Mostrar/ocultar al hover
      parent.appendChild(icon);
      parent.addEventListener("mouseenter", () => icon.style.display = "block");
      parent.addEventListener("mouseleave", () => icon.style.display = "none");

      // Click en el icono dispara el selector
      icon.addEventListener("click", e => {
        e.stopPropagation();
        onChangeImage({ target: img }, uid, () => setCtxMenu(c => ({ ...c, show: false })));
      });
    });
  }, [html, edits, uid]);

  // 4) Menú contextual para texto y links
  useEffect(() => {
    const handler = e => {
      if (e.target.closest(".ctx-menu")) return;
      const el = e.target.closest("[data-editable-type]");
      if (!el) return setCtxMenu(c => ({ ...c, show: false }));
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setCtxMenu({
        show:   true,
        x:      r.left + r.width / 2,
        y:      r.top - 8,
        type:   el.dataset.editableType,
        target: el
      });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // 5) Hide menu
  const hideMenu = () => setCtxMenu(c => ({ ...c, show: false }));

  // 6) Render
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { ref: containerRef }),
    ctxMenu.show && ReactDOM.createPortal(
      React.createElement(
        "div",
        {
          className: "ctx-menu",
          style: { position: "fixed", left: ctxMenu.x, top: ctxMenu.y }
        },
        ctxMenu.type === "text" &&
          React.createElement("button", { onClick: () => onChangeRichText(ctxMenu, uid, hideMenu) }, "Editar texto"),
        ctxMenu.type === "link" &&
          React.createElement("button", { onClick: () => onChangeLink(ctxMenu, uid, hideMenu) }, "Editar link")
      ),
      document.body
    )
  );
}


// Nota: getComputedStyle viene de window, no hace falta importarlo.
// Solo recuerda importar `onChangeImage` y `onChangeLink` arriba.
