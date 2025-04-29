// src/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyAKbwnvxvvcdA5fefw1zvMbeVeD5J2F-lI",
  authDomain: "smartstay-84693.firebaseapp.com",
  projectId: "smartstay-84693",
  storageBucket: "smartstay-84693.appspot.com",
  messagingSenderId: "34181113154",
  appId: "1:34181113154:web:258b0ffce329ad2ff214db",
  measurementId: "G-BCKS623LTS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithGithub = () => signInWithPopup(auth, githubProvider);

export const registerWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { auth, googleProvider, githubProvider };
export default app;
