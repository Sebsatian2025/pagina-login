// public/editor/modules/firestore.js
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db }                  from "./firebase.js";

/**
 * Carga todas las ediciones del usuario para una página (pageId).
 */
export async function loadEdits(uid, pageId) {
  const ref  = doc(db, "edits", uid, "pages", pageId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

/**
 * Guarda o mergea una sola edición dentro del documento de la página.
 */
export async function saveEdit(uid, pageId, selector, field, value) {
  const ref     = doc(db, "edits", uid, "pages", pageId);
  const payload = { [selector]: { [field]: value } };
  await setDoc(ref, payload, { merge: true });
}
