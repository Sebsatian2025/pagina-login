// public/editor/modules/firebaseInit.js
import { initializeApp }        from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 1. Tu configuración real de Firebase
const firebaseConfig = {
  apiKey:            "AIzaSyBT02qJDOa6N1giU-TmSd7gZrsVLtamIfc",
  authDomain:        "admin-pwa-f1cf8.firebaseapp.com",
  projectId:         "admin-pwa-f1cf8",
  storageBucket:     "admin-pwa-f1cf8.appspot.com",
  messagingSenderId: "958223835117",
  appId:              "1:958223835117:web:165c816afa75d9a4da11e4",
  measurementId:     "G-F0MEWWTCGQ"
};

// 2. Inicializa la App una sola vez
const app  = initializeApp(firebaseConfig);

// 3. Instancia Auth y Firestore usando ese mismo app
export const auth = getAuth(app);
export const db   = getFirestore(app);

// 4. Opcional: habilitar cache offline con IndexedDB
enableIndexedDbPersistence(db)
  .catch(err => console.warn("⚠️ Persistence failed:", err));

// 5. Si trabajas con emuladores locals (solo dev):
// connectAuthEmulator(auth, "http://localhost:9099");
// connectFirestoreEmulator(db, "localhost", 8080);
