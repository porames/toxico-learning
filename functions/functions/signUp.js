import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";

export const signUp = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;

    const {email, rama_id, pw} = req.body;
    if (!email || !rama_id || !pw) {
      res.status(400).json({error: "Missing data points"});
      return;
    }

    const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .where("rama_id", "==", rama_id)
        .limit(1)
        .get();

    if (snapshot.empty) {
      res.status(404).json({error: "No approved user found"});
      return;
    }

    const userDoc = snapshot.docs[0];

    const userRecord = await admin.auth().createUser({
      email,
      password: pw,
      displayName: userDoc.data().name,
      emailVerified: false,
      disabled: false,
    });

    await userDoc.ref.update({
      authId: userRecord.uid,
      signedUp: true,
      signedUpAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({success: true, uid: userRecord.uid});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "Internal server error"});
  }
});
