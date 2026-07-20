import admin from "firebase-admin";
import {cert, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

const firebaseConfig = {
  storageBucket: "rama-toxico-edu.firebasestorage.app",
};

if (process.env.FUNCTIONS_EMULATOR) {
  firebaseConfig.credential = cert("../secret/serviceAccount.json");
}

initializeApp(firebaseConfig);

const storage = admin.storage();
const db = getFirestore(undefined, "rama-toxicology-bkk");

export {admin, storage, db};
