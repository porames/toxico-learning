import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";

export const createUser = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {email, name, year, role, rama_id} = req.body;
    const needsYear = role === "student" || role === "resident";
    if (!email || !name || !role || !rama_id || (needsYear && !year)) {
      res.status(400).json({error: "Missing data points"});
      return;
    }

    const userRef = db.collection("users").doc();
    await userRef.set({
      email,
      name,
      ...(year && {year}),
      role,
      rama_id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      signedUp: false,
    });

    res.json({success: true, id: userRef.id});
  } catch (err) {
    console.error("CODE:", err.code);
    console.error("DETAILS:", err.details);
    res.status(err.status || 500).json({error: err.message || "Internal server error"});
  }
});
