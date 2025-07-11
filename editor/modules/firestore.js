// public/editor/modules/firestore.js
import { db }                   from "./firebaseInit.js";
import { doc, getDoc, setDoc }  from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/**
 * Carga ediciones para uid + pageId
 */
export async function loadEdits(uid, pageId) {
  const ref  = doc(db, "edits", uid, "pages", pageId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

/**
 * Guarda una edición en uid + pageId
 */
export async function saveEdit(uid, pageId, selector, field, value) {
  const ref     = doc(db, "edits", uid, "pages", pageId);
  const payload = { [selector]: { [field]: value } };
  return setDoc(ref, payload, { merge: true });
}
