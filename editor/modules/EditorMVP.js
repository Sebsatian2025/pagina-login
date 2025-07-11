// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                          from "https://esm.sh/react-dom@18.2.0";
import { loadEdits }                     from "./firestore.js";
import { onChangeRichText }              from "./richTextEditor.js";
import { onChangeImage }                 from "./imageEditor.js";
import { onChangeLink }                  from "./linkEditor.js";

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const [html, setHtml]       = useState("");
  const [edits, setEdits]     = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show: false, x: 0, y: 0, type: null, target: null
  });

  // Cargar ediciones previas
  useEffect(() => {
    if (!uid) return;
    loadEdits(uid).then(setEdits).catch(console.error);
  }, [uid]);

  // Carga de htmlUrl … (idéntico a tu versión anterior)
  // …

  // Menú contextual
  useEffect(() => {
    const handler = e => {
      // 1) Si haces click dentro del menú, no lo cerramos
      if (e.target.closest(".ctx-menu")) return;

      // 2) Detectar elemento editable
      const el = e.target.closest("[data-editable-type]");
      if (!el) {
        setCtxMenu(c => ({ ...c, show: false }));
        return;
      }

      e.preventDefault();
      const r = el.getBoundingClientRect();

      // 3) Calculamos coordenadas RELATIVAS AL VIEWPORT
      const x = r.left + r.width / 2;
      const y = r.top  - 8;

      // 4) Mostramos el menú con position:fixed
      setCtxMenu({
        show:   true,
        x,       // valores del viewport
        y,
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

  return (
    <>
      <div ref={containerRef} />
      {ctxMenu.show && ReactDOM.createPortal(
        <div
          className="ctx-menu"
          style={{
            position: "fixed",      // <-- clave: fijo al viewport
            left:     ctxMenu.x,
            top:      ctxMenu.y,
          }}
        >
          {ctxMenu.type === "text" && (
            <button
              onClick={() => onChangeRichText(ctxMenu, uid, hideMenu)}
            >
              Editar texto
            </button>
          )}
          {ctxMenu.type === "image" && (
            <button onClick={() => onChangeImage(ctxMenu, uid, hideMenu)}>
              Cambiar imagen
            </button>
          )}
          {ctxMenu.type === "link" && (
            <button onClick={() => onChangeLink(ctxMenu, uid, hideMenu)}>
              Cambiar link
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
