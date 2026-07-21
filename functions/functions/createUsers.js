import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";

const BASE_REQUIRED = ["email", "name", "role", "rama_id"];

export const createUsers = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {students} = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({error: "Missing or empty students array"});
      return;
    }

    const batch = db.batch();
    const ids = [];

    for (const s of students) {
      const missing = BASE_REQUIRED.filter((f) => !s[f]);
      const needsYear = s.role === "student" || s.role === "resident";
      if (needsYear && !s.year) missing.push("year");
      if (missing.length > 0) {
        res.status(400).json({
          error: `Student "${s.name || s.email}" is missing: ${missing.join(", ")}`,
        });
        return;
      }

      const ref = db.collection("users").doc();
      batch.set(ref, {
        email: s.email,
        name: s.name,
        year: s.year,
        role: s.role,
        rama_id: s.rama_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        signedUp: false,
      });
      ids.push(ref.id);
    }

    await batch.commit();

    res.json({success: true, count: students.length, ids});
  } catch (err) {
    console.error("CODE:", err.code);
    console.error("DETAILS:", err.details);
    res.status(err.status || 500).json({error: err.message || "Internal server error"});
  }
});
