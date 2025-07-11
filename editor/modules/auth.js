// public/editor/modules/auth.js
import { auth }        from "./firebaseInit.js";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } 
                      from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/**
 * Devuelve la instancia de Auth ya inicializada.
 */
export function initAuth() {
  return auth;
}

/**
 * Llama a tu callback cuando el usuario esté listo
 */
export function onUserReady(callback) {
  return onAuthStateChanged(auth, user => callback(user));
}
