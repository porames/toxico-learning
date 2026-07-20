import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";
import {validateStudentIds} from "../lib/validate.js";

export const enrolStudents = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {studentIds, classId} = req.body;
    if (!studentIds || !classId) {
      res.status(400).json({error: "Missing data points"});
      return;
    }

    const cleaned = validateStudentIds(studentIds);
    const batch = db.batch();
    const classRef = db.collection("classes").doc(classId);
    batch.update(classRef, {
      enroledStudents: admin.firestore.FieldValue.arrayUnion(...cleaned),
    });
    cleaned.forEach((id) => {
      const userRef = db.collection("users").doc(id);
      batch.update(userRef, {
        enroledClasses: admin.firestore.FieldValue.arrayUnion(classId),
      });
    });
    await batch.commit();

    return res.status(200).json({success: true, count: cleaned.length});
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({error: err.message || "Something went wrong"});
  }
});
