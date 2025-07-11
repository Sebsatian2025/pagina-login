// public/editor/editor.js

// 0) Debug: comprueba que el script se cargue
console.log("🚀 editor.js cargado desde:", window.location.pathname);

import React from "https://esm.sh/react@18.2.0";
import ReactDOM from "https://esm.sh/react-dom@18.2.0";

import { initAuth, onUserReady } from "./modules/auth.js";
import { getParam }              from "./modules/utils.js";
import { EditorMVP }             from "./modules/EditorMVP.js";

// 1) Inicializa Auth (configuración ya viene de firebaseInit.js)
console.log("🔑 Inicializando Auth");
const auth = initAuth();

// 2) Lee htmlUrl de la query string
const htmlUrl = getParam("htmlUrl");
console.log("🔗 htmlUrl:", htmlUrl);

// 3) Punto de montaje React
const root = document.getElementById("editor-root");
console.log("🎯 Punto de montaje React:", root);

// 4) Espera a que el usuario esté autenticado
onUserReady(user => {
  console.log("🔔 onUserReady callback, user:", user);
  if (!user) {
    console.warn("Usuario no autenticado, redirigiendo al login…");
    window.location.href = "/";
    return;
  }

  const uid = user.uid;
  console.log("✅ Usuario autenticado:", uid);

  if (!root) {
    console.error("❌ No se encontró #editor-root en el DOM");
    return;
  }

  // 5) Monta el EditorMVP con React
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
