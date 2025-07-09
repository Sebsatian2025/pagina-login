// login.js - Manejo de autenticación con Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// 🎯 Obtener elementos del DOM
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginPass");

// 🧠 Lógica de envío del formulario
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) return;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      loginSuccess?.classList.remove("d-none");
      loginError?.classList.add("d-none");
      if (typeof showPreloader === "function") showPreloader();
      setTimeout(() => {
        window.location.href = `/editor/${uid}.html`;
      }, 500);
    })
    .catch((error) => {
      console.error("[Login Error]:", error.message);
      loginError?.classList.remove("d-none");
      loginSuccess?.classList.add("d-none");
    });
});
