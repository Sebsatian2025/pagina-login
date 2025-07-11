// public/editor/modules/firebaseInit.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBT02qJDOa6N1giU-TmSd7gZrsVLtamIfc",
  authDomain:        "admin-pwa-f1cf8.firebaseapp.com",
  projectId:         "admin-pwa-f1cf8",
  storageBucket:     "admin-pwa-f1cf8.appspot.com",
  messagingSenderId: "958223835117",
  appId:             "1:958223835117:web:165c816afa75d9a4da11e4",
  measurementId:     "G-F0MEWWTCGQ"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  cache: {
    tabSynchronization: true
  }
});

export const auth = getAuth(app);
