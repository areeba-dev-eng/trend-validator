// src/config/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey:            'AIzaSyAVU_VCK2pgwwkat4ujj7Wpul1mvQcjHLA',
  authDomain:        'trend-validator-app.firebaseapp.com',
  projectId:         'trend-validator-app',
  storageBucket:     'trend-validator-app.appspot.com',
  messagingSenderId: '272170158396',
  appId:             '1:272170158396:web:64e3f47b228912cf137639',
};

/* Guard against re-initialization on hot-reload in dev */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/*
 * React Native: use AsyncStorage persistence so the session survives
 * app restarts. getAuth() defaults to in-memory (lost on restart).
 *
 * Web: Firebase handles session storage via IndexedDB automatically —
 * no extra config needed.
 *
 * The try/catch handles the case where initializeAuth() is called a
 * second time (hot reload in Expo dev server) — it throws "already
 * initialized" and we fall back to getAuth() which returns the same
 * instance.
 */
let auth;

if (Platform.OS !== 'web') {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_alreadyInitialized) {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;