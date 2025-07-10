// login.js - Autenticación Firebase + Firestore + redirección

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1) Configurar Firebase
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

  // Reseteo de mensajes
  loginError.classList.add("d-none");
  loginSuccess.classList.add("d-none");

  const email    = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  if (!email || !password) return;

  let uid;
  // 3) Intento de login
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    console.log("✅ Auth correcto, uid =", uid);

    loginSuccess.classList.remove("d-none");
    loginSuccess.classList.add("show");
  } catch (authError) {
    console.error("❌ Error en autenticación:", authError.message);
    loginError.textContent = "Usuario o contraseña incorrectos";
    loginError.classList.remove("d-none");
    loginError.classList.add("show");
    return;  // Salimos si falla login
  }

  // 4) Si llegamos acá, el login fue OK. Ahora obtenemos la URL desde Firestore
  let baseUrl = "";
  try {
    const siteRef  = doc(db, "sites", uid);
    const siteSnap = await getDoc(siteRef);

    if (siteSnap.exists()) {
      baseUrl = siteSnap.data().url;
      console.log("📄 URL de landing:", baseUrl);
    } else {
      console.warn("⚠️ No hay landing configurada para uid:", uid);
      // Puedes definir aquí un fallback
      baseUrl = window.location.origin;
    }
  } catch (dbError) {
    console.error("❌ Error al leer Firestore:", dbError.message);
    // Mostrar mensaje genérico de fallo
    loginError.textContent = "No se pudo cargar su sitio, intente más tarde.";
    loginError.classList.remove("d-none");
    loginError.classList.add("show");
    return;  // Salimos si falla Firestore
  }

  // 5) Redirección final con preloader
  const destino = `${baseUrl}/editor.html?uid=${uid}`;
  console.log("➡️ Redirigiendo a", destino);

  setTimeout(() => {
    if (typeof showPreloader === "function") showPreloader();
    setTimeout(() => window.location.href = destino, 1000);
  }, 1200);
});
