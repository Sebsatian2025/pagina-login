// public/editor/editor.js

// 0) Debug: verifica que el script se cargue realmente
console.log("🚀 editor.js cargado desde:", window.location.pathname);

import React from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";
import { initAuth, onUserReady } from "./modules/auth.js";
import { getParam }              from "./modules/utils.js";
import { EditorMVP }             from "./modules/EditorMVP.js";

// 1) Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT02qJDOa6N1giU-TmSd7gZrsVLtamIfc",
  authDomain: "admin-pwa-f1cf8.firebaseapp.com",
  projectId: "admin-pwa-f1cf8",
  storageBucket: "admin-pwa-f1cf8.firebasestorage.app",
  messagingSenderId: "958223835117",
  appId: "1:958223835117:web:165c816afa75d9a4da11e4",
  measurementId: "G-F0MEWWTCGQ"
};

// 2) Inicializa Auth
console.log("🔑 Inicializando Auth");
const auth = initAuth(firebaseConfig);

// 3) Lee htmlUrl de la query string
const htmlUrl = getParam("htmlUrl");
console.log("🔗 htmlUrl:", htmlUrl);

// 4) Punto de montaje React
const root = document.getElementById("editor-root");
console.log("🎯 Punto de montaje React:", root);

// 5) Espera a que el usuario esté autenticado
onUserReady(auth, user => {
  console.log("🔔 onUserReady callback, user:", user);
  if (!user) {
    console.warn("No autenticado, redirigiendo al login.");
    window.location.href = "/";
    return;
  }

  const uid = user.uid;
  console.log("✅ Usuario autenticado:", uid);

  if (!root) {
    console.error("❌ No se encontró #editor-root en el DOM");
    return;
  }

  // Monta el componente EditorMVP con React
  const props = { htmlUrl, uid };
  console.log("🏗️ Montando EditorMVP con props:", props);

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
