import {onDocumentDeleted} from "firebase-functions/v2/firestore";
import {db} from "../lib/admin.js";

export const cleanupClass = onDocumentDeleted("classes/{classId}", async (event) => {
  const classId = event.params.classId;

  const lecturesSnap = await db.collection("classes", classId, "lectures").get();
  if (lecturesSnap.empty) return;

  const batch = db.batch();
  let opCount = 0;

  for (const lectureDoc of lecturesSnap.docs) {
    const materialsSnap = await db.collection(
      "classes", classId, "lectures", lectureDoc.id, "materials"
    ).get();
    materialsSnap.docs.forEach((m) => {
      batch.delete(m.ref);
      opCount++;
    });
    batch.delete(lectureDoc.ref);
    opCount++;

    if (opCount >= 400) {
      await batch.commit();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
});
