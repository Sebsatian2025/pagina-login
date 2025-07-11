// public/editor/modules/firebase.js
// Carga Firebase App y Firestore desde la CDN ESM de gstatic

import { initializeApp }     from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore }      from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "…",
  appId:             "…"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
