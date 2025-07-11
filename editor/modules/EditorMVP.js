// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                                from "https://esm.sh/react-dom@18.2.0";

import { loadEdits }        from "./firestore.js";
import { onChangeRichText } from "./richTextEditor.js";
import { onChangeImage }    from "./imageEditor.js";
import { onChangeLink }     from "./linkEditor.js";
import { onChangeBgImage }  from "./bgImageEditor.js";
import { onChangeBgColor }  from "./bgColorEditor.js";
import { getSelector }      from "./utils.js";

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  // guardamos por selector: { maxLines, lineHeight }
  const sizesRef     = useRef(new Map());
  const pageId       = encodeURIComponent(htmlUrl);

  const [html, setHtml]   = useState("");
  const [edits, setEdits] = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show:   false,
    x:      0,
    y:      0,
    types:  [],
    target: null
  });

  // 1) Carga ediciones previas de Firestore
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid, pageId)
      .then(data => setEdits(data))
      .catch(console.error);
  }, [uid, pageId]);

  // 2) Trae el HTML original + clona <head> + inyecta admin.css
  useEffect(() => {
    if (!htmlUrl) return;
    fetch(htmlUrl)
      .then(r => r.text())
      .then(text => {
        const doc    = new DOMParser().parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // base para assets relativos
        const base = document.createElement("base");
        base.href  = origin + "/";
        document.head.insertBefore(base, document.head.firstChild);

        // clona meta, link, style
        doc.head.querySelectorAll("meta, link[href], style")
          .forEach(n => {
            const c = n.cloneNode(true);
            if (c.tagName === "LINK" && !c.href.startsWith("http")) {
              c.href = new URL(n.getAttribute("href"), origin).href;
            }
            document.head.appendChild(c);
          });

        // inyecta admin.css
        const css = document.createElement("link");
        css.rel  = "stylesheet";
        css.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.appendChild(css);

        setHtml(doc.body.innerHTML);
      })
      .catch(console.error);
  }, [htmlUrl]);

  // 3) Renderiza body, aplica ediciones, marca tipos e inyecta iconos
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // 3.1) Aplica cada edición guardada
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.html)       el.innerHTML               = ch.html;
      if (ch.text)       el.innerText               = ch.text;
      if (ch.href)       el.href                    = ch.href;
      if (ch.src)        el.src                     = ch.src;
      if (ch.style?.backgroundImage) {
        el.style.backgroundImage    = `url(${ch.style.backgroundImage})`;
        el.style.backgroundSize     = "cover";
        el.style.backgroundPosition = "center";
      }
      if (ch.style?.backgroundColor) {
        el.style.backgroundColor = ch.style.backgroundColor;
      }
    });

    // 3.2) Recorre todo el DOM, detecta tipos, captura tamaños e inyecta iconos
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];

      // TEXTO (incluye <a>)
      if (
        ["H1","H2","H3","P","SPAN","DIV","A"].includes(el.tagName) &&
        el.textContent.trim()
      ) {
        types.push("text");
      }

      // LINK
      if (el.tagName === "A") {
        types.push("link");
      }

      // IMAGEN normal
      if (el.tagName === "IMG") {
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
          position: "absolute",
          top:      "8px",
          right:    "8px",
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
            setCtxMenu(m => ({ ...m, show: false }))
          );
        });
      }

      // FONDO imagen
      const bgImg = getComputedStyle(el).backgroundImage;
      if (bgImg.startsWith("url(") && bgImg !== "none") {
        types.push("bgImage");
      }

      // FONDO color (bootstrap bg-primary o inline)
      const bgColor = getComputedStyle(el).backgroundColor;
      if (
        bgColor &&
        !bgImg &&
        !/^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bgColor)
      ) {
        types.push("bgColor");
        el.style.cursor = "pointer";
        const parent = el;
        if (getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }
        const colorIcon = document.createElement("div");
        colorIcon.className = "bgcolor-edit-icon";
        colorIcon.innerText = "🎨";
        Object.assign(colorIcon.style, {
          position: "absolute",
          top:      "8px",
          left:     "8px",
          background: "var(--bs-success)",
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
        parent.appendChild(colorIcon);
        parent.addEventListener("mouseenter", () => colorIcon.style.display = "block");
        parent.addEventListener("mouseleave", () => colorIcon.style.display = "none");
        colorIcon.addEventListener("click", e => {
          e.stopPropagation();
          onChangeBgColor({ target: el }, uid, pageId, () =>
            setCtxMenu(m => ({ ...m, show: false }))
          );
        });
      }

      // CÁLCULO DE MAX LÍNEAS para bloques de texto
      if (types.includes("text")) {
        const sel   = getSelector(el);
        const style = getComputedStyle(el);
        const containerH = style.maxHeight !== "none"
          ? parseFloat(style.maxHeight)
          : el.getBoundingClientRect().height;
        const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const rawLines = Math.floor(containerH / lh);
        // permitimos tantas líneas como cabían originalmente (mínimo 1)
        const maxLines = Math.max(1, rawLines);
        sizesRef.current.set(sel, { maxLines, lineHeight: lh });
      }

      if (types.length) {
        el.dataset.editableTypes = types.join("|");
      }
    });
  }, [html, edits, uid, pageId]);

  // 4) Click global para menú contextual
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
        x:      rect.left + rect.width / 2,
        y:      rect.top  - 8,
        types,
        target: el
      });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const hideMenu = () => setCtxMenu(m => ({ ...m, show: false }));

  // 5) Renderiza
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
            style:     { position: "fixed", left: ctxMenu.x, top: ctxMenu.y }
          },
          ctxMenu.types.includes("text") &&
            React.createElement(
              "button",
              { onClick: () =>
                  onChangeRichText(
                    ctxMenu, uid, pageId, hideMenu, sizesRef.current
                  )
              },
              "Editar texto"
            ),
          ctxMenu.types.includes("link") &&
            React.createElement(
              "button",
              { onClick: () => onChangeLink(ctxMenu, uid, pageId, hideMenu) },
              "Editar link"
            ),
          ctxMenu.types.includes("image") &&
            React.createElement(
              "button",
              { onClick: () => onChangeImage(ctxMenu, uid, pageId, hideMenu) },
              "Editar imagen"
            ),
          ctxMenu.types.includes("bgImage") &&
            React.createElement(
              "button",
              { onClick: () => onChangeBgImage(ctxMenu, uid, pageId, hideMenu) },
              "Editar fondo"
            ),
          ctxMenu.types.includes("bgColor") &&
            React.createElement(
              "button",
              { onClick: () => onChangeBgColor(ctxMenu, uid, pageId, hideMenu) },
              "Editar color"
            )
        ),
        document.body
      )
  );
}
