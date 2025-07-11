// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                                from "https://esm.sh/react-dom@18.2.0";

import { loadEdits }        from "./firestore.js";
import { onChangeRichText } from "./richTextEditor.js";
import { onChangeImage }    from "./imageEditor.js";
import { onChangeLink }     from "./linkEditor.js";
import { onChangeBgImage }  from "./bgImageEditor.js";

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  // Usa la URL completa como pageId para aislar edits
  const pageId = encodeURIComponent(htmlUrl);

  const [html, setHtml]   = useState("");
  const [edits, setEdits] = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show:   false,
    x:      0,
    y:      0,
    types:  [],
    target: null
  });

  // 1) Carga ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid, pageId)
      .then(data => setEdits(data))
      .catch(console.error);
  }, [uid, pageId]);

  // 2) Fetch HTML + clonar <head> + inyectar admin.css
  useEffect(() => {
    if (!htmlUrl) return;
    fetch(htmlUrl)
      .then(r => r.text())
      .then(text => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // <base> para rutas relativas
        const baseEl = document.createElement("base");
        baseEl.href  = origin + "/";
        document.head.insertBefore(baseEl, document.head.firstChild);

        // Clona meta, link, style
        doc.head.querySelectorAll("meta, link[href], style").forEach(n => {
          const clone = n.cloneNode(true);
          if (clone.tagName === "LINK" && !clone.href.startsWith("http")) {
            clone.href = new URL(n.getAttribute("href"), origin).href;
          }
          document.head.appendChild(clone);
        });

        // Inyecta tu CSS de admin
        const css = document.createElement("link");
        css.rel  = "stylesheet";
        css.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.appendChild(css);

        setHtml(doc.body.innerHTML);
      })
      .catch(console.error);
  }, [htmlUrl]);

  // 3) Renderiza y aplica ediciones + marca tipos + añade iconos de imagen
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // Aplica ediciones guardadas
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.html) el.innerHTML = ch.html;
      if (ch.text) el.innerText  = ch.text;
      if (ch.href) el.href        = ch.href;
      if (ch.src)  el.src         = ch.src;
      if (ch.style?.backgroundImage) {
        el.style.backgroundImage    = `url(${ch.style.backgroundImage})`;
        el.style.backgroundSize     = "cover";
        el.style.backgroundPosition = "center";
      }
    });

    // Marca tipos y añade icono sobre imágenes
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];

      // Texto
      if (
        ["H1","H2","H3","P","SPAN","DIV"].includes(el.tagName) &&
        el.textContent.trim()
      ) {
        types.push("text");
      }

      // Link
      if (el.tagName === "A") {
        types.push("link");
      }

      // Imagen normal
      if (el.tagName === "IMG") {
        // icono de lápiz
        types.push("image");
        el.style.cursor = "pointer";
        const parent = el.parentElement;
        if (getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }
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
        parent.appendChild(icon);
        parent.addEventListener("mouseenter", () => icon.style.display = "block");
        parent.addEventListener("mouseleave", () => icon.style.display = "none");
        icon.addEventListener("click", e => {
          e.stopPropagation();
          onChangeImage({ target: el }, uid, pageId, () =>
            setCtxMenu(c => ({ ...c, show: false }))
          );
        });
      }

      // Fondo
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.startsWith("url(") && bg !== "none") {
        types.push("bgImage");
      }

      if (types.length) {
        el.dataset.editableTypes = types.join("|");
      }
    });
  }, [html, edits, uid, pageId]);

  // 4) Clic global para menú contextual (texto, link, fondo)
  useEffect(() => {
    const handler = e => {
      if (e.target.closest(".ctx-menu")) return;
      const el = e.target.closest("[data-editable-types]");
      if (!el) {
        setCtxMenu(m => ({ ...m, show: false }));
        return;
      }
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const types = el.dataset.editableTypes.split("|");
      setCtxMenu({
        show:   true,
        x:      rect.left + rect.width/2,
        y:      rect.top  - 8,
        types,
        target: el
      });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const hideMenu = () => {
    setCtxMenu(m => ({ ...m, show: false }));
  };

  // 5) Render
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { ref: containerRef }),
    ctxMenu.show &&
      ReactDOM.createPortal(
        React.createElement(
          "div",
          {
            className: "ctx-menu",
            style: { position: "fixed", left: ctxMenu.x, top: ctxMenu.y }
          },
          // Solo texto, link y fondo (no imagen)
          ctxMenu.types.includes("text") &&
            React.createElement(
              "button",
              { onClick: () => onChangeRichText(ctxMenu, uid, pageId, hideMenu) },
              "Editar texto"
            ),
          ctxMenu.types.includes("link") &&
            React.createElement(
              "button",
              { onClick: () => onChangeLink(ctxMenu, uid, pageId, hideMenu) },
              "Editar link"
            ),
          ctxMenu.types.includes("bgImage") &&
            React.createElement(
              "button",
              { onClick: () => onChangeBgImage(ctxMenu, uid, pageId, hideMenu) },
              "Editar fondo"
            )
        ),
        document.body
      )
  );
}
