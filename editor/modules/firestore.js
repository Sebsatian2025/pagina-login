// public/editor/modules/firestore.js
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// helper “lazy” que devuelve la instancia de Firestore
function getDb() {
  return getFirestore();  // Usará la app DEFAULT si ya fue inicializada
}

export async function saveEdit(uid, selector, field, value) {
  const db   = getDb();
  const ref  = doc(db, "edits", uid);
  const data = { [selector]: { [field]: value } };
  await setDoc(ref, data, { merge: true });
}

export async function loadEdits(uid) {
  const db   = getDb();
  const ref  = doc(db, "edits", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}
