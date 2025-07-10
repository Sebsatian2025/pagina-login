// public/editor/editor.js
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

// 2) Inicializa Auth y Firestore internamente
const auth = initAuth(firebaseConfig);

// 3) Lee htmlUrl de la query string
const htmlUrl = getParam("htmlUrl");

// 4) Punto de montaje React
const root = document.getElementById("editor-root");

// 5) Espera a que el usuario esté autenticado
onUserReady(auth, user => {
  if (!user) {
    console.warn("No autenticado, redirigiendo al login.");
    return window.location.href = "/";
  }
  const uid = user.uid;
  console.log("✅ Usuario autenticado:", uid);

  // Monta el componente EditorMVP con React
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
