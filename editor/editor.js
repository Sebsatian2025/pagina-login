// editor.js
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import React, { useState, useEffect, useRef } 
  from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";

// 1) Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT02qJDOa6N1giU-TmSd7gZrsVLtamIfc",
  authDomain: "admin-pwa-f1cf8.firebaseapp.com",
  projectId: "admin-pwa-f1cf8",
  storageBucket: "admin-pwa-f1cf8.firebasestorage.app",
  messagingSenderId: "958223835117",
  appId: "1:958223835117:web:165c816afa75d9a4da11e4",
  measurementId: "G-F0MEWWTCGQ"
};
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// 2) Helpers Firestore
async function saveEdit(uid, selector, field, value) {
  const ref  = doc(db, "edits", uid);
  const data = { [selector]: { [field]: value } };
  await setDoc(ref, data, { merge: true });
}

async function loadEdits(uid) {
  const ref  = doc(db, "edits", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

// 3) Leer parámetros de la URL
function getParam(name) {
  const p = new URLSearchParams(window.location.search).get(name);
  return p ? decodeURIComponent(p) : "";
}

// 4) Componente EditorMVP
function EditorMVP({ htmlUrl, uid }) {
  const containerRef = useRef(null);
  const [html, setHtml]     = useState("");
  const [edits, setEdits]   = useState({});
  const [ctxMenu, setCtxMenu] = useState({
    show:false, x:0, y:0, type:null, target:null
  });

  // 4.1) Cargar ediciones previas
  useEffect(() => {
    if (uid) {
      loadEdits(uid).then(setEdits).catch(console.error);
    }
  }, [uid]);

  // 4.2) Fetch de la landing + estilos
  useEffect(() => {
    if (!htmlUrl) return console.error("Falta htmlUrl");
    fetch(htmlUrl)
      .then(r => r.text())
      .then(text => {
        const parser = new DOMParser();
        const doc    = parser.parseFromString(text, "text/html");
        const origin = new URL(htmlUrl).origin;

        // Base para rutas relativas
        const baseEl = document.createElement("base");
        baseEl.href  = origin + "/";
        document.head.insertBefore(baseEl, document.head.firstChild);

        // Clonar CSS externos
        doc.head.querySelectorAll("link[rel=stylesheet]").forEach(link => {
          const href    = new URL(link.href, origin).href;
          const newLink = document.createElement("link");
          newLink.rel   = "stylesheet";
          newLink.href  = href;
          document.head.appendChild(newLink);
        });

        // Clonar estilos inline
        doc.head.querySelectorAll("style").forEach(s => {
          document.head.appendChild(s.cloneNode(true));
        });

        // Guardar body para después inyectar
        setHtml(doc.body.innerHTML);
      })
      .catch(err => console.error("Fetch error:", err));
  }, [htmlUrl]);

  // 4.3) Inyectar HTML + aplicar edits
  useEffect(() => {
    if (!html) return;
    const root = containerRef.current;
    root.innerHTML = html;

    // Aplicar ediciones previas
    Object.entries(edits).forEach(([sel, ch]) => {
      const el = root.querySelector(sel);
      if (!el) return;
      if (ch.text) el.innerText = ch.text;
      if (ch.href) el.href      = ch.href;
      if (ch.src)  el.src       = ch.src;
    });

    // Marcar editables
    root.querySelectorAll("h1,h2,h3,p,span").forEach(el => {
      el.dataset.editableType = "text";
      el.contentEditable      = false;
    });
    root.querySelectorAll("img").forEach(el => {
      el.dataset.editableType = "image";
    });
    root.querySelectorAll("a").forEach(el => {
      el.dataset.editableType = "link";
    });
  }, [html, edits]);

  // 4.4) Menú contextual
  useEffect(() => {
    const handler = e => {
      const el = e.target.closest("[data-editable-type]");
      if (!el) return setCtxMenu(s => ({ ...s, show:false }));
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setCtxMenu({
        show:   true,
        x:      r.left + r.width/2,
        y:      r.top - 8,
        type:   el.dataset.editableType,
        target: el
      });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // 4.5) Editar texto y guardar
  function onChangeText() {
    const el = ctxMenu.target;
    el.contentEditable = true;
    el.focus();
    el.onblur = async () => {
      el.contentEditable = false;
      setCtxMenu(s => ({ ...s, show:false }));

      // Selector único (id o nth-child)
      const selector = el.id
        ? `#${el.id}`
        : `${el.tagName.toLowerCase()}:nth-child(${[...el.parentNode.children].indexOf(el)+1})`;
      const newText = el.innerText;

      try {
        await saveEdit(uid, selector, "text", newText);
        console.log("✔️ Texto guardado:", selector, newText);
      } catch(err) {
        console.error("❌ Error guardando texto:", err);
      }
    };
  }

  // 4.6) Render con createElement
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { ref: containerRef }),
    ctxMenu.show && ReactDOM.createPortal(
      React.createElement(
        "div",
        { className:"ctx-menu", style:{ left:ctxMenu.x, top:ctxMenu.y } },
        ctxMenu.type==="text" &&
          React.createElement("button",{ onClick:onChangeText }, "Cambiar texto")
      ),
      document.body
    )
  );
}

// 5) Montaje solo tras Auth
const htmlUrl = getParam("htmlUrl");
const root    = document.getElementById("editor-root");

onAuthStateChanged(auth, user => {
  if (!user) {
    console.warn("No autenticado, redirigiendo al login.");
    return window.location.href = "/";
  }
  const uid = user.uid;
  console.log("Usuario autenticado:", uid);

  // Renderizar EditorMVP
  const props = { htmlUrl, uid };
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(root).render(
      React.createElement(EditorMVP, props)
    );
  } else {
    ReactDOM.render(
      React.createElement(EditorMVP, props),
      root
    );
  }
});
