// public/editor/modules/firestore.js
import { getFirestore, doc, getDoc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore();

export async function saveEdit(uid, selector, field, value) {
  const ref  = doc(db, "edits", uid);
  const data = { [selector]: { [field]: value } };
  await setDoc(ref, data, { merge: true });
}

export async function loadEdits(uid) {
  const ref  = doc(db, "edits", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

