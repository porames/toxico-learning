import {onRequest} from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {db} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";

export const getStudents = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {classId} = req.body;
    if (!classId || typeof classId !== "string") {
      return res.status(400).json({message: "classId is required."});
    }

    const classSnap = await db.collection("classes").doc(classId).get();
    if (!classSnap.exists) {
      return res.status(404).json({message: `Class not found: ${classId}`});
    }

    const enroledStudents = classSnap.data()?.enroledStudents ?? [];

    if (!Array.isArray(enroledStudents) || enroledStudents.length === 0) {
      return res.status(200).json({students: []});
    }

    const chunkSize = 30;
    const chunks = [];
    for (let i = 0; i < enroledStudents.length; i += chunkSize) {
      chunks.push(enroledStudents.slice(i, i + chunkSize));
    }

    const snapshots = await Promise.all(
        chunks.map((chunk) =>
          db
              .collection("users")
              .where(admin.firestore.FieldPath.documentId(), "in", chunk)
              .get(),
        ),
    );

    const students = snapshots.flatMap((snap) =>
      snap.docs.map((doc) => ({id: doc.id, ...doc.data()})),
    );

    return res.status(200).json({students});
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({error: err.message || "Something went wrong"});
  }
});
