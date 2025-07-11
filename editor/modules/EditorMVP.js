import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                                from "https://esm.sh/react-dom@18.2.0";

import { loadEdits }        from "./firestore.js";
import { onChangeRichText } from "./richTextEditor.js";
import { onChangeImage }    from "./imageEditor.js";
import { onChangeLink }     from "./linkEditor.js";
import { onChangeBgImage }  from "./bgImageEditor.js";
import { onChangeBgColor }  from "./bgColorEditor.js";
import { getSelector }      from "./utils.js";  // Necesario para claves

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const sizesRef     = useRef(new Map());  // Map<selector, { maxLines, lineHeight }>
  const pageId       = encodeURIComponent(htmlUrl);

  const [html, setHtml]   = useState("");
  const [edits, setEdits] = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show: false, x: 0, y: 0, types: [], target: null
  });

  // 1) Carga ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid, pageId).then(setEdits).catch(console.error);
  }, [uid, pageId]);

  // 2) Fetch HTML + head + admin.css
  useEffect(() => {
    if (!htmlUrl) return;
    fetch(htmlUrl)
      .then(res => res.text())
      .then(text => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // <base> para rutas relativas
        const base = document.createElement("base");
        base.href  = origin + "/";
        document.head.insertBefore(base, document.head.firstChild);

        // Clonar meta, link, style
        doc.head.querySelectorAll("meta, link[href], style").forEach(n => {
          const clone = n.cloneNode(true);
          if (clone.tagName==="LINK" && !clone.href.startsWith("http")) {
            clone.href = new URL(n.getAttribute("href"), origin).href;
          }
          document.head.append(clone);
        });

        // Inyectar admin.css
        const css = document.createElement("link");
        css.rel  = "stylesheet";
        css.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.append(css);

        setHtml(doc.body.innerHTML);
      })
      .catch(console.error);
  }, [htmlUrl]);

  // 3) Renderizar + aplicar ediciones + marcar tipos + capturar máximos
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // 3.1) Aplica ediciones guardadas
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
      if (ch.style?.backgroundColor) {
        el.style.backgroundColor = ch.style.backgroundColor;
      }
    });

    // 3.2) Marca tipos e inyecta iconos
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];

      // Texto
      if (["H1","H2","H3","P","SPAN","DIV","A"].includes(el.tagName) &&
          el.textContent.trim()) {
        types.push("text");
      }

      // Link
      if (el.tagName === "A") {
        types.push("link");
      }

      // Imagen
      if (el.tagName === "IMG") {
        types.push("image");
        // ... icon logic (igual que tenías) ...
      }

      // Fondo imagen
      const bgImg = getComputedStyle(el).backgroundImage;
      if (bgImg.startsWith("url(") && bgImg !== "none") {
        types.push("bgImage");
      }

      // Fondo color
      const bgColor = getComputedStyle(el).backgroundColor;
      if (bgColor &&
          !bgImg &&
          !bgColor.startsWith("rgba(0, 0, 0, 0)")) {
        types.push("bgColor");
        // icon logic (igual que tenías para bgColor) ...
      }

      // 3.3) Captura máximo de líneas para elementos con text
      if (types.includes("text")) {
        const sel = getSelector(el);
        const style = window.getComputedStyle(el);
        // Si hay max-height definido, úsalo; si no, altura actual
        let maxH = style.maxHeight !== "none"
                    ? parseFloat(style.maxHeight)
                    : el.getBoundingClientRect().height;
        // Lée line-height para dividir
        const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize)*1.2;
        const maxLines = Math.floor(maxH / lh);
        sizesRef.current.set(sel, { maxLines, lineHeight: lh });
      }

      if (types.length) el.dataset.editableTypes = types.join("|");
    });
  }, [html, edits]);

  // 4) Menú contextual global
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
      setCtxMenu({ show: true, x: rect.left + rect.width/2,
                   y: rect.top - 8, types, target: el });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const hideMenu = () => setCtxMenu(m => ({ ...m, show: false }));

  // 5) Render
  return React.createElement(
    React.Fragment, null,
    React.createElement("div", { ref: containerRef }),
    ctxMenu.show && ReactDOM.createPortal(
      React.createElement(
        "div",
        { className: "ctx-menu",
          style: { position: "fixed", left: ctxMenu.x, top: ctxMenu.y } },
        ctxMenu.types.includes("text") &&
          React.createElement("button", {
            onClick: () =>
              onChangeRichText(
                ctxMenu, uid, pageId, hideMenu, sizesRef.current
              )
          }, "Editar texto"),
        ctxMenu.types.includes("link") &&
          React.createElement("button", {
            onClick: () => onChangeLink(ctxMenu, uid, pageId, hideMenu)
          }, "Editar link"),
        ctxMenu.types.includes("image") &&
          React.createElement("button", {
            onClick: () => onChangeImage(ctxMenu, uid, pageId, hideMenu)
          }, "Editar imagen"),
        ctxMenu.types.includes("bgImage") &&
          React.createElement("button", {
            onClick: () => onChangeBgImage(ctxMenu, uid, pageId, hideMenu)
          }, "Editar fondo"),
        ctxMenu.types.includes("bgColor") &&
          React.createElement("button", {
            onClick: () => onChangeBgColor(ctxMenu, uid, pageId, hideMenu)
          }, "Editar color")
      ),
      document.body
    )
  );
}
