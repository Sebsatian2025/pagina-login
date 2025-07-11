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

  const ADMIN_HOST = window.location.origin;

  // 1) Cargar ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid).then(setEdits).catch(console.error);
  }, [uid]);

  // 2) Fetch + clonación del <head>
  useEffect(() => {
    if (!htmlUrl) {
      console.error("❌ Falta htmlUrl");
      return;
    }
    fetch(htmlUrl)
      .then(res => res.text())
      .then(text => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // A) <base> para rutas relativas
        const baseEl = document.createElement("base");
        baseEl.href  = origin + "/";
        document.head.insertBefore(baseEl, document.head.firstChild);

        // B) Clonar <meta>
        doc.head.querySelectorAll("meta").forEach(m => {
          document.head.appendChild(m.cloneNode(true));
        });

        // C) Clonar <link href=...>
        doc.head.querySelectorAll("link[href]").forEach(link => {
          const nl = link.cloneNode();
          if (!nl.href.startsWith("http")) {
            nl.href = new URL(link.getAttribute("href"), origin).href;
          }
          document.head.appendChild(nl);
        });

        // D) Clonar <style>
        doc.head.querySelectorAll("style").forEach(s => {
          document.head.appendChild(s.cloneNode(true));
        });

        // E) Inyectar admin.css
        const adminCss = document.createElement("link");
        adminCss.rel  = "stylesheet";
        adminCss.href = `${ADMIN_HOST}/assets/css/admin.css`;
        document.head.appendChild(adminCss);

        // F) Guardar <body>
        setHtml(doc.body.innerHTML);
      })
      .catch(err => console.error("❌ Fetch error:", err));
  }, [htmlUrl]);

  // 3) Inyectar HTML + aplicar ediciones
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    Object.entries(edits).forEach(([sel, changes]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (changes.html) el.innerHTML = changes.html;
      else if (changes.text) el.innerText = changes.text;
      if (changes.href) el.href = changes.href;
      if (changes.src)  el.src  = changes.src;
    });

    root.querySelectorAll("h1,h2,h3,p,span").forEach(el => {
      el.dataset.editableType = "text";
    });
    root.querySelectorAll("img").forEach(el => {
      el.dataset.editableType = "image";
    });
    root.querySelectorAll("a").forEach(el => {
      el.dataset.editableType = "link";
    });
  }, [html, edits]);

  // 4) Menú contextual con position:fixed
  useEffect(() => {
    const handler = e => {
      // Ignorar clicks dentro del menú
      if (e.target.closest(".ctx-menu")) return;

      const el = e.target.closest("[data-editable-type]");
      if (!el) {
        setCtxMenu(c => ({ ...c, show: false }));
        return;
      }
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      setCtxMenu({
        show:   true,
        x:      rect.left + rect.width / 2,
        y:      rect.top - 8,
        type:   el.dataset.editableType,
        target: el
      });
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  function hideMenu() {
    setCtxMenu(c => ({ ...c, show: false }));
  }

  // 5) Render usando createElement para evitar JSX
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
            style: {
              position: "fixed",
              left:     ctxMenu.x,
              top:      ctxMenu.y
            }
          },
          ctxMenu.type === "text" &&
            React.createElement(
              "button",
              { onClick: () => onChangeRichText(ctxMenu, uid, hideMenu) },
              "Editar texto"
            ),
          ctxMenu.type === "image" &&
            React.createElement(
              "button",
              { onClick: () => onChangeImage(ctxMenu, uid, hideMenu) },
              "Cambiar imagen"
            ),
          ctxMenu.type === "link" &&
            React.createElement(
              "button",
              { onClick: () => onChangeLink(ctxMenu, uid, hideMenu) },
              "Cambiar link"
            )
        ),
        document.body
      )
  );
}
