// login.js - con debug paso a paso

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1) Configuración Firebase
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
const auth = getAuth(app);
const db   = getFirestore(app);

// 2) Referencias al DOM
const loginForm    = document.getElementById("loginForm");
const loginError   = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginPass");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.clear();
  console.log("🔹 submit recibido");

  // Reset de alerts
  loginError.classList.add("d-none");
  loginSuccess.classList.add("d-none");

  const email    = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  console.log("📧", email, "🔑", password ? "****" : "(vacío)");

  if (!email || !password) {
    console.warn("Campos vacíos, abortando");
    return;
  }

  let uid;
  // 3) Intento de autenticación
  try {
    console.log("➡️ Intentando signInWithEmailAndPassword...");
    const credential = await signInWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    console.log("✅ Auth OK, uid:", uid);

    loginSuccess.classList.remove("d-none");
    loginSuccess.classList.add("show");
  } catch (authError) {
    console.error("❌ Auth failed:", authError.code, authError.message);
    loginError.textContent = "Usuario o contraseña incorrectos";
    loginError.classList.remove("d-none");
    loginError.classList.add("show");
    return;  // Salimos aquí si falla auth
  }

  // 4) Fetch URL desde Firestore
  let baseUrl = "";
  try {
    console.log("➡️ Buscando documento en Firestore: sites/", uid);
    const siteRef  = doc(db, "sites", uid);
    const siteSnap = await getDoc(siteRef);

    if (siteSnap.exists()) {
      baseUrl = siteSnap.data().url;
      console.log("📄 URL encontrada:", baseUrl);
    } else {
      console.warn("⚠️ No hay documento sites/", uid);
      baseUrl = window.location.origin;  // fallback
    }
  } catch (dbError) {
    console.error("❌ Firestore fetch failed:", dbError.code, dbError.message);
    loginError.textContent = "Error cargando datos, intente luego";
    loginError.classList.remove("d-none");
    loginError.classList.add("show");
    return;  // Salimos si falla Firestore
  }

  // 5) Redirección
  const destino = `${baseUrl}/editor.html?uid=${uid}`;
  console.log("➡️ Redirigiendo a", destino);

  setTimeout(() => {
    if (typeof showPreloader === "function") showPreloader();
    setTimeout(() => {
      window.location.href = destino;
    }, 1000);
  }, 1200);
});
