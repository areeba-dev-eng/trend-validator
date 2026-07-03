// src/services/auth.service.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/* ─── Email / password ───────────────────────────────────────────────────── */

export async function signupWithEmail(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
  name,
  username: email.split('@')[0].toLowerCase(),
  email,
  plan: 'free',

  credits: 9999,
  totalAnalyses: 0,

  createdAt: serverTimestamp(),
}, { merge: true });
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/* ─── Google ─────────────────────────────────────────────────────────────── */

export async function loginWithGoogleCredential(idToken) {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);

  /* Provision Firestore doc on first Google login */
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (!snap.exists()) {
    await setDoc(doc(db, 'users', cred.user.uid), {
      name:      cred.user.displayName || '',
      username:  (cred.user.email || '').split('@')[0].toLowerCase(),
      email:     cred.user.email || '',
      plan:      'free',
      createdAt: serverTimestamp(),
    });
  }

  return cred.user;
}

/* ─── Logout ─────────────────────────────────────────────────────────────── */

export async function logoutUser() {
  await signOut(auth);
}

/* ─── Profile ────────────────────────────────────────────────────────────── */

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, updates) {
  await setDoc(doc(db, 'users', uid), updates, { merge: true });
  if (auth.currentUser && updates.name) {
    await updateProfile(auth.currentUser, { displayName: updates.name });
  }
}

export async function upgradeToPremium(uid) {
  await setDoc(doc(db, 'users', uid), {
    plan:        'premium',
    upgradedAt:  serverTimestamp(),
  }, { merge: true });
}

/** Update Firebase Auth email + Firestore. Requires recent login. */
export async function updateUserEmail(newEmail) {
  if (!auth.currentUser) throw new Error('Not authenticated');

  await updateEmail(auth.currentUser, newEmail);

  await setDoc(
    doc(db, 'users', auth.currentUser.uid),
    { email: newEmail },
    { merge: true },
  );
}

/** Update Firebase Auth password. Requires recent login. */
export async function updateUserPassword(newPassword) {
  if (!auth.currentUser) throw new Error('Not authenticated');

  await updatePassword(auth.currentUser, newPassword);
}