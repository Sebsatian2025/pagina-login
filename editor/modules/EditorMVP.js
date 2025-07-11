// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                          from "https://esm.sh/react-dom@18.2.0";
import { loadEdits }                     from "./firestore.js";
import { onChangeRichText }              from "./richTextEditor.js";
import { onChangeImage }                 from "./imageEditor.js";
import { onChangeLink }                  from "./linkEditor.js";
import { onChangeBgImage }               from "./bgImageEditor.js";

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const [html, setHtml]       = useState("");
  const [edits, setEdits]     = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show: false,
    x:    0,
    y:    0,
    types: [],   // ahora un array de tipos
    target: null
  });

  // 1) Carga ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid).then(setEdits).catch(console.error);
  }, [uid]);

  // 2) Fetch + clonación de head (igual que antes)
  // ...

  // 3) Inyección de html + dataset.editableType
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // Aplica ediciones previas
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.html) el.innerHTML = ch.html;
      if (ch.text) el.innerText  = ch.text;
      if (ch.href) el.href        = ch.href;
      if (ch.src)  el.src         = ch.src;
    });

    // Marcar tipos
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];
      if (["H1","H2","H3","P","SPAN","DIV"].includes(el.tagName) && el.textContent.trim())
        types.push("text");
      if (el.tagName === "IMG")
        types.push("image");
      if (el.tagName === "A")
        types.push("link");
      // background-image?
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none" && bg.startsWith("url("))
        types.push("bgImage");

      if (types.length > 0) {
        el.dataset.editableTypes = types.join("|");
      }
    });
  }, [html, edits]);

  // 4) Clic global para menú contextual
  useEffect(() => {
    const handler = e => {
      if (e.target.closest(".ctx-menu")) return;

      const el = e.target.closest("[data-editable-types]");
      if (!el) {
        setCtxMenu(c => ({ ...c, show: false }));
        return;
      }
      e.preventDefault();

      // obtenemos tipos y coordenadas
      const types = el.dataset.editableTypes.split("|");
      const r     = el.getBoundingClientRect();

      setCtxMenu({
        show:   true,
        x:      r.left + r.width / 2,
        y:      r.top - 8,
        types,
        target: el
      });
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  function hideMenu() {
    setCtxMenu(c => ({ ...c, show: false }));
  }

  // 5) Render
  return React.createElement(
    React.Fragment, null,
    React.createElement("div", { ref: containerRef }),
    ctxMenu.show && ReactDOM.createPortal(
      React.createElement(
        "div",
        {
          className: "ctx-menu",
          style:     { position: "fixed", left: ctxMenu.x, top: ctxMenu.y }
        },
        // por cada tipo, un botón
        ctxMenu.types.includes("text") &&
          React.createElement(
            "button",
            { onClick: () => onChangeRichText(ctxMenu, uid, hideMenu) },
            "Editar texto"
          ),

        ctxMenu.types.includes("link") &&
          React.createElement(
            "button",
            { onClick: () => onChangeLink(ctxMenu, uid, hideMenu) },
            "Editar link"
          ),

        ctxMenu.types.includes("image") &&
          React.createElement(
            "button",
            { onClick: () => onChangeImage(ctxMenu, uid, hideMenu) },
            "Editar imagen"
          ),

        ctxMenu.types.includes("bgImage") &&
          React.createElement(
            "button",
            { onClick: () => onChangeBgImage(ctxMenu, uid, hideMenu) },
            "Editar fondo"
          )
      ),
      document.body
    )
  );
}
