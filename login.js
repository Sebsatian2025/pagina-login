// login.js
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const loginForm    = document.getElementById("loginForm");
const loginError   = document.getElementById("loginError");
const loginSuccess = document.getElementById("loginPass");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.clear();

  loginError.classList.add("d-none");
  loginSuccess.classList.add("d-none");

  const email    = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  if (!email || !password) {
    loginError.textContent = "Completa ambos campos";
    return loginError.classList.remove("d-none");
  }

  let uid;
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    loginSuccess.classList.remove("d-none");
  } catch {
    loginError.textContent = "Usuario o contraseña incorrectos";
    return loginError.classList.remove("d-none");
  }

  let baseUrl = window.location.origin;
  try {
    const siteSnap = await getDoc(doc(db, "sites", uid));
    if (siteSnap.exists()) {
      baseUrl = siteSnap.data().url;
    }
  } catch {
    loginError.textContent = "Error cargando datos, intente luego";
    return loginError.classList.remove("d-none");
  }

  // 🔧 Evitar doble barra accidental
  baseUrl = baseUrl.replace(/\/$/, "");

  const htmlUrl = encodeURIComponent(`${baseUrl}/index.html`);
  const destino = `/editor/editor.html?uid=${uid}&htmlUrl=${htmlUrl}`;

  if (typeof showPreloader === "function") {
    showPreloader();
    setTimeout(() => (window.location.href = destino), 800);
  } else {
    window.location.href = destino;
  }
});
