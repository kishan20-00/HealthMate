import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA7lIys30aRuOg7fMPKnsIJvHJ1L03PaE",
  authDomain: "healthmate-662a3.firebaseapp.com",
  projectId: "healthmate-662a3",
  storageBucket: "healthmate-662a3.firebasestorage.app",
  messagingSenderId: "464790381831",
  appId: "1:464790381831:web:1dd4133b556cf6be8791a2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
