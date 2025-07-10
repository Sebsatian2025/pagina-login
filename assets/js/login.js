// login.js - Manejo de autenticación con Firebase y redirección dinámica

import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT02qJDOa6N1giU-TmSd7gZrsVLtamIfc",
  authDomain: "admin-pwa-f1cf8.firebaseapp.com",
  projectId: "admin-pwa-f1cf8",
  storageBucket: "admin-pwa-f1cf8.firebasestorage.app",
  messagingSenderId: "958223835117",
  appId: "1:958223835117:web:165c816afa75d9a4da11e4",
  measurementId: "G-F0MEWWTCGQ"
};

// 🚀 Inicializar Firebase
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// 🎯 Elementos del DOM
const loginForm    = document.getElementById("loginForm");
const loginError   = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginPass");

// 🧠 Envío del formulario con redirección dinámica desde Firestore
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  if (!email || !password) return;

  try {
    // Autenticación
    const userCredential = 
      await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Mostrar alerta de éxito
    loginSuccess.classList.remove("d-none");
    loginSuccess.classList.add("show");
    loginError.classList.add("d-none");
    loginError.classList.remove("show");

    // Obtener URL de la landing para este UID
    const siteRef  = doc(db, "sites", uid);
    const siteSnap = await getDoc(siteRef);

    let baseUrl;
    if (siteSnap.exists()) {
      baseUrl = siteSnap.data().url;
    } else {
      console.warn("No hay landing configurada para uid:", uid);
      baseUrl = ""; // fallback a raíz actual o a un editor por defecto
    }

    // Construir destino con editor.html
    const destino = `${baseUrl}/editor.html?uid=${uid}`;

    // Esperar para que el usuario vea la alerta y muestre preloader
    setTimeout(() => {
      if (typeof showPreloader === "function") {
        showPreloader();
      }
      setTimeout(() => {
        window.location.href = destino;
      }, 1000);
    }, 1200);

  } catch (error) {
    console.error("[Login Error]:", error.message);

    // Mostrar alerta de error
    loginError.classList.remove("d-none");
    loginError.classList.add("show");
    loginSuccess.classList.add("d-none");
    loginSuccess.classList.remove("show");
  }
});
