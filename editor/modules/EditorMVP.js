// public/editor/modules/EditorMVP.js
import React, { useState, useEffect, useRef } from "https://esm.sh/react@18.2.0";
import ReactDOM                          from "https://esm.sh/react-dom@18.2.0";
import { loadEdits }                     from "./firestore.js";
import { onChangeRichText }              from "./richTextEditor.js";
import { onChangeImage }                 from "./imageEditor.js";
import { onChangeLink }                  from "./linkEditor.js";
import { onChangeBgImage }               from "./bgImageEditor.js";

// Debug imports
console.log("✅ EditorMVP.js loaded", {
  onChangeRichText,
  onChangeImage,
  onChangeLink,
  onChangeBgImage
});

export function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const [html, setHtml]       = useState("");
  const [edits, setEdits]     = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show:   false,
    x:      0,
    y:      0,
    types:  [],
    target: null
  });

  // 1) Load previous edits
  useEffect(() => {
    if (!uid) return;
    console.log("🔔 loadEdits for uid:", uid);
    loadEdits(uid)
      .then(editsData => {
        console.log("🗄️ Edits loaded:", editsData);
        setEdits(editsData);
      })
      .catch(err => console.error("❌ loadEdits error:", err));
  }, [uid]);

  // 2) Fetch HTML and clone head
  useEffect(() => {
    if (!htmlUrl) {
      console.error("❌ htmlUrl missing");
      return;
    }
    console.log("🔗 Fetching htmlUrl:", htmlUrl);
    fetch(htmlUrl)
      .then(res => res.text())
      .then(text => {
        console.log("📄 HTML fetched, parsing...");
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // <base> tag for relative assets
        const baseEl = document.createElement("base");
        baseEl.href  = origin + "/";
        document.head.insertBefore(baseEl, document.head.firstChild);

        // Clone meta, link, style
        doc.head.querySelectorAll("meta, link[href], style").forEach(node => {
          const clone = node.cloneNode(true);
          if (clone.tagName === "LINK" && !clone.href.startsWith("http")) {
            clone.href = new URL(node.getAttribute("href"), origin).href;
          }
          document.head.appendChild(clone);
        });

        // Inject admin.css
        const cssLink = document.createElement("link");
        cssLink.rel  = "stylesheet";
        cssLink.href = `${window.location.origin}/assets/css/admin.css`;
        document.head.appendChild(cssLink);

        setHtml(doc.body.innerHTML);
        console.log("✅ HTML body set");
      })
      .catch(err => console.error("❌ Fetch htmlUrl error:", err));
  }, [htmlUrl]);

  // 3) Inject HTML into container and apply edits
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    console.log("🚧 Rendering HTML into container");
    root.innerHTML = html;

    // Apply saved edits
    Object.entries(edits).forEach(([selector, change]) => {
      const el = root.querySelector(selector);
      if (!el) return;
      console.log("✏️ Applying edit", selector, change);
      if (change.html) el.innerHTML = change.html;
      if (change.text) el.innerText  = change.text;
      if (change.href) el.href        = change.href;
      if (change.src)  el.src         = change.src;
      if (change.style?.backgroundImage) {
        el.style.backgroundImage = `url(${change.style.backgroundImage})`;
      }
    });

    // Mark editable types
    root.querySelectorAll("*").forEach(el => {
      el.removeAttribute("data-editable-types");
      const types = [];
      if (["H1","H2","H3","P","SPAN","DIV"].includes(el.tagName) && el.textContent.trim()) {
        types.push("text");
      }
      if (el.tagName === "IMG") {
        types.push("image");
      }
      if (el.tagName === "A") {
        types.push("link");
      }
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none" && bg.startsWith("url(")) {
        types.push("bgImage");
      }
      if (types.length) {
        el.dataset.editableTypes = types.join("|");
      }
    });

    console.log("🔖 Editable types set");
  }, [html, edits]);

  // 4) Context menu handler
  useEffect(() => {
    const clickHandler = e => {
      if (e.target.closest(".ctx-menu")) return;
      const el = e.target.closest("[data-editable-types]");
      if (!el) {
        setCtxMenu(menu => ({ ...menu, show: false }));
        return;
      }
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const types = el.dataset.editableTypes.split("|");
      console.log("📍 Show ctx-menu for types:", types, "on element:", el);
      setCtxMenu({
        show:   true,
        x:      rect.left + rect.width / 2,
        y:      rect.top  - 8,
        types,
        target: el
      });
    };
    document.addEventListener("click", clickHandler, true);
    return () => document.removeEventListener("click", clickHandler, true);
  }, []);

  const hideMenu = () => {
    console.log("🚪 Hiding ctx-menu");
    setCtxMenu(menu => ({ ...menu, show: false }));
  };

  // 5) Render EditorMVP
  console.log("🔄 Rendering EditorMVP, ctxMenu.show =", ctxMenu.show);
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
