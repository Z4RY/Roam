import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Login with email and password
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Signup with email and password
export const signup = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = () => {
  return signOut(auth);
};