import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpPEG-2JOt-Z7qveGXNdwC0bLCNT6JjZs",
  authDomain: "rama-toxico-edu.firebaseapp.com",
  projectId: "rama-toxico-edu",
  storageBucket: "rama-toxico-edu.firebasestorage.app",
  messagingSenderId: "1078336294040",
  appId: "1:1078336294040:web:f49579ffafaa4db2f9d4ed"
};

// Avoid re-initializing the app on hot reloads / multiple imports
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
