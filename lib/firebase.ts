import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCctOjp7MCbAQ94cOm_yoUfaYZWekE5jeQ",
  authDomain: "roam2234.firebaseapp.com",
  databaseURL: "https://roam2234-default-rtdb.firebaseio.com",
  projectId: "roam2234",
  storageBucket: "roam2234.firebasestorage.app",
  messagingSenderId: "930027567151",
  appId: "1:930027567151:web:3703e7b8c31f5e616caeda",
  measurementId: "G-ZPRKT1B9CV"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
