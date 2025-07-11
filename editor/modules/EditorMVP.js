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

  // 1) Carga ediciones guardadas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid, pageId).then(setEdits).catch(console.error);
  }, [uid, pageId]);

  // 2) Trae el HTML original y clona <head> / admin.css
  useEffect(() => {
    if (!htmlUrl) return;
    fetch(htmlUrl)
      .then(r => r.text())
      .then(text => {
        const doc    = new DOMParser().parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        const base = document.createElement("base");
        base.href  = origin + "/";
        document.head.insertBefore(base, document.head.firstChild);

        doc.head.querySelectorAll("meta, link[href], style")
          .forEach(n => {
            const clone = n.cloneNode(true);
            if (clone.tagName === "LINK" && !clone.href.startsWith("http")) {
              clone.href = new URL(n.getAttribute("href"), origin).href;
            }
            document.head.appendChild(clone);
          });

        const adminCss = document.createElement("link");
        adminCss.rel  = "stylesheet";
        adminCss.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.appendChild(adminCss);

        setHtml(doc.body.innerHTML);
      })
      .catch(console.error);
  }, [htmlUrl]);

  // 3) Render + aplica ediciones + marca tipos + iconos + captura líneas
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // Aplica cada edición
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.html)               el.innerHTML            = ch.html;
      if (ch.text)               el.innerText            = ch.text;
      if (ch.href)               el.href                 = ch.href;
      if (ch.src)                el.src                  = ch.src;
      if (ch.style?.backgroundImage) {
        el.style.backgroundImage    = `url(${ch.style.backgroundImage})`;
        el.style.backgroundSize     = "cover";
        el.style.backgroundPosition = "center";
      }
      if (ch.style?.backgroundColor) {
        el.style.backgroundColor = ch.style.backgroundColor;
      }
    });

    // Recorre todo el DOM
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];

      // TEXT
      if (
        ["H1","H2","H3","P","SPAN","DIV","A"]
          .includes(el.tagName) &&
        el.textContent.trim()
      ) {
        types.push("text");
      }

      // LINK
      if (el.tagName === "A") {
        types.push("link");
      }

      // IMG (etiqueta)
      if (el.tagName === "IMG") {
        types.push("image");
        el.style.cursor = "pointer";
        const parent = el.parentElement;
        if (getComputedStyle(parent).position === "static") {
          parent.style.position = "relative";
        }
        const imgIcon = document.createElement("div");
        imgIcon.className = "img-edit-icon";
        imgIcon.innerText = "✎";
        Object.assign(imgIcon.style, {
          position:   "absolute",
          top:        "8px",
          right:      "8px",
          background: "rgba(0,0,0,0.6)",
          color:      "#fff",
          borderRadius: "4px",
          padding:    "2px 6px",
          fontSize:   "14px",
          cursor:     "pointer",
          display:    "none",
          zIndex:     1001
        });
        parent.appendChild(imgIcon);
        parent.addEventListener("mouseenter", () => imgIcon.style.display = "block");
        parent.addEventListener("mouseleave", () => imgIcon.style.display = "none");
        imgIcon.addEventListener("click", e => {
          e.stopPropagation();
          onChangeImage({ target: el }, uid, pageId, () =>
            setCtxMenu(m => ({ ...m, show: false }))
          );
        });
      }

      // BACKGROUND-IMAGE (CSS)
      const bgImg = getComputedStyle(el).backgroundImage;
      if (bgImg.startsWith("url(") && bgImg !== "none") {
        types.push("bgImage");
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
        }
        const bgIcon = document.createElement("div");
        bgIcon.className = "bgimage-edit-icon";
        bgIcon.innerText = "🖼";
        Object.assign(bgIcon.style, {
          position:   "absolute",
          top:        "8px",
          right:      "8px",
          background: "rgba(0,0,0,0.6)",
          color:      "#fff",
          borderRadius: "4px",
          padding:    "2px 6px",
          fontSize:   "14px",
          cursor:     "pointer",
          display:    "none",
          zIndex:     1001
        });
        el.appendChild(bgIcon);
        el.addEventListener("mouseenter", () => bgIcon.style.display = "block");
        el.addEventListener("mouseleave", () => bgIcon.style.display = "none");
        bgIcon.addEventListener("click", e => {
          e.stopPropagation();
          onChangeBgImage({ target: el }, uid, pageId, () =>
            setCtxMenu(m => ({ ...m, show: false }))
          );
        });
      }

      // BACKGROUND-COLOR
      const bgColor = getComputedStyle(el).backgroundColor;
      if (
        bgColor &&
        !bgImg &&
        !/^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bgColor)
      ) {
        types.push("bgColor");
        el.style.cursor = "pointer";
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
        }
        const brush = document.createElement("div");
        brush.className = "bgcolor-edit-icon";
        brush.innerText = "🖌";
        Object.assign(brush.style, {
          position:   "absolute",
          top:        "8px",
          left:       "8px",
          background: "rgba(0,0,0,0.6)",
          color:      "#fff",
          borderRadius: "4px",
          padding:    "2px 6px",
          fontSize:   "14px",
          cursor:     "pointer",
          display:    "none",
          zIndex:     1001
        });
        el.appendChild(brush);
        el.addEventListener("mouseenter", () => brush.style.display = "block");
        el.addEventListener("mouseleave", () => brush.style.display = "none");
        brush.addEventListener("click", e => {
          e.stopPropagation();
          onChangeBgColor({ target: el }, uid, pageId, () =>
            setCtxMenu(m => ({ ...m, show: false }))
          );
        });
      }

      // CÁLCULO DE MÁXIMO LÍNEAS
      if (types.includes("text")) {
        const sel   = getSelector(el);
        const style = getComputedStyle(el);
        const containerH = style.maxHeight !== "none"
          ? parseFloat(style.maxHeight)
          : el.getBoundingClientRect().height;
        const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const rawLines = Math.floor(containerH / lh);
        const maxLines = Math.max(1, rawLines);
        sizesRef.current.set(sel, { maxLines, lineHeight: lh });
      }

      if (types.length) {
        el.dataset.editableTypes = types.join("|");
      }
    });
  }, [html, edits, uid, pageId]);

  // 4) Click global → menú contextual
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

  // 5) Render final
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
