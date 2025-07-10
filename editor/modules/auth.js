// public/editor/modules/auth.js
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function initAuth(firebaseConfig) {
  const app  = initializeApp(firebaseConfig);
  return getAuth(app);
}

export function onUserReady(auth, callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}

