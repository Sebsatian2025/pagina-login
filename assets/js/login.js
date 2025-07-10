// login.js - Manejo de autenticación con Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 Configuración de Firebase (tuya)
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🎯 Elementos del DOM
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginPass");

// 🗺️ Mapa de redirecciones por UID
const redirections = {
  "CE71EXrIdmhRBLfnjpR0plrAMeG2": "https://heartfelt-sunflower-58e1df.netlify.app/#page-top"
};

// 🧠 Envío del formulario
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) return;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // ✔️ Mostrar alerta de éxito animada
      loginSuccess?.classList.remove("d-none");
      loginSuccess?.classList.add("show");
      loginError?.classList.add("d-none");
      loginError?.classList.remove("show");

      // 📍 Obtener la URL de destino para este UID o usar editor por defecto
      const destino = redirections[uid] || "/editor/index.html";

      // ⏳ Esperar para que el usuario vea la alerta
      setTimeout(() => {
        // 🌀 Mostrar preloader
        if (typeof showPreloader === "function") showPreloader();

        // Esperar otro segundo antes de redirigir
        setTimeout(() => {
          window.location.href = destino;
        }, 1000);
      }, 1200);
    })
    .catch((error) => {
      console.error("[Login Error]:", error.message);

      // ❌ Mostrar alerta de error animada
      loginError?.classList.remove("d-none");
      loginError?.classList.add("show");
      loginSuccess?.classList.add("d-none");
      loginSuccess?.classList.remove("show");
    });
});
