import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import { initializeApp, cert } from "firebase-admin/app";
import sharp from "sharp";

const app = initializeApp({
    credential: cert("../secret/serviceAccount.json"),
});

const storage = admin.storage();
const db = admin.firestore();

const auth = admin.auth();

function validateStudentIds(studentIds) {
    if (!Array.isArray(studentIds)) {
        throw new Error("studentIds must be an array.");
    }
    if (studentIds.length === 0) {
        throw new Error("studentIds cannot be empty.");
    }

    // every item must be a non-empty string
    const invalidType = studentIds.find((id) => typeof id !== "string" || id.trim() === "");
    if (invalidType !== undefined) {
        throw new Error(`Invalid studentId found: ${JSON.stringify(invalidType)}`);
    }

    // no duplicates
    const uniqueIds = new Set(studentIds);
    if (uniqueIds.size !== studentIds.length) {
        throw new Error("studentIds contains duplicates.");
    }

    // reasonable batch size sanity check (Firestore batch limit is 500 ops total)
    if (studentIds.length > 200) {
        throw new Error("Too many studentIds in a single request (max 200).");
    }

    return [...uniqueIds]; // return cleaned array
}

export const enrolStudents = onRequest(async (req, res) => {
    try {
        //Authentication header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await admin
            .firestore()
            .collection("users")
            .where("authId", "==", decodedToken.uid)
            .get();
        const userData = userDoc.docs[0].data();
        if (userDoc.empty || userData.role !== "admin") {
            res.status(403).json({
                error: "Forbidden",
            });
            console.log("unauthenticated")
            return;
        }
        const { studentIds, classId } = req.body;
        if (!studentIds || !classId) {
            res.status(400).json({
                error: "Missing data points",
            });
            return;
        }


        validateStudentIds(req.body.studentIds);


        const db = admin.firestore();
        const batch = db.batch();
        const classRef = db.collection("classes").doc(classId);
        batch.update(classRef, {
            enroledStudents: admin.firestore.FieldValue.arrayUnion(...studentIds),
        });
        studentIds.forEach((id) => {
            const userRef = db.collection("users").doc(id);
            batch.update(userRef, {
                enroledClasses: admin.firestore.FieldValue.arrayUnion(classId),
            });
        });
        await batch.commit();

        return res.status(200).json({ success: true, count: studentIds.length });

    } catch (err) {
        console.log(err)
    }
})

export const getStudents = onRequest(async (req, res) => {
    try {
        //Authentication header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await admin
            .firestore()
            .collection("users")
            .where("authId", "==", decodedToken.uid)
            .get();
        const userData = userDoc.docs[0].data();
        if (userDoc.empty || userData.role !== "admin") {
            res.status(403).json({
                error: "Forbidden",
            });
            console.log("unauthenticated")
            return;
        }

        // Validate classId
        const { classId } = req.body;
        if (!classId || typeof classId !== "string") {
            return res.status(400).json({ message: "classId is required." });
        }

        const db = admin.firestore();

        // Fetch the class doc
        const classSnap = await db.collection("classes").doc(classId).get();
        if (!classSnap.exists) {
            return res.status(404).json({ message: `Class not found: ${classId}` });
        }

        const enroledStudents = classSnap.data()?.enroledStudents ?? [];

        if (!Array.isArray(enroledStudents) || enroledStudents.length === 0) {
            return res.status(200).json({ students: [] });
        }

        // Firestore 'in' queries max out at 30 items, so chunk if needed
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
                    .get()
            )
        );

        const students = snapshots.flatMap((snap) =>
            snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        return res.status(200).json({ students });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Something went wrong" });
    }
});

export const signUp = onRequest(async (req, res) => {
    try {
        const { email, rama_id, pw } = req.body;
        if (!email || !rama_id || !pw) {
            res.status(400).json({
                error: "Missing data points",
            });
            return;
        }
        const snapshot = await admin.firestore()
            .collection("users")
            .where("email", "==", email)
            .where("rama_id", "==", rama_id)
            .limit(1)
            .get();

        if (snapshot.empty) {
            res.status(404).json({
                error: "No approved user found",
            });
            return;
        }

        const userDoc = snapshot.docs[0];

        const userRecord = await admin.auth().createUser({
            email,
            pw,
            name: userDoc.name,
            emailVerified: false,
            disabled: false,
        });
        await userDoc.ref.update({
            authId: userRecord.uid,
            signedUp: true,
            signedUpAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            uid: userRecord.uid,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error",
        });
    }

})

export const createUser = onRequest(async (req, res) => {
    try {
        //Authentication header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await admin
            .firestore()
            .collection("users")
            .where("authId", "==", decodedToken.uid)
            .get();
        const userData = userDoc.docs[0].data();
        if (userDoc.empty || userData.role !== "admin") {
            res.status(403).json({
                error: "Forbidden",
            });
            console.log("unauthenticated")
            return;
        }
        // Processing request
        const { email, name, year, role, rama_id } = req.body;

        if (!email || !name || !year || !role || !rama_id) {
            res.status(400).json({
                error: "Missing data points",
            });
            return;
        }

        const userRef = admin.firestore().collection("users").doc();

        await userRef.set({
            email,
            name,
            year,
            role,
            rama_id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            signedUp: false
        });

        res.json({
            success: true,
            id: userRef.id,
        });
    } catch (err) {
        console.error("CODE:", err.code);
        console.error("DETAILS:", err.details);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

export const imageUpload = onRequest(async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userDoc = await db
            .collection("users")
            .where("authId", "==", decodedToken.uid)
            .get();
        const userData = userDoc.docs[0].data();
        if (userDoc.empty || userData.role !== "admin") {
            res.status(403).json({ error: "Forbidden" });
            return;
        }

        const { imageData, caseId, investigationId } = req.body;
        if (!imageData || !caseId || !investigationId) {
            res.status(400).json({ error: "Missing required fields: imageData, caseId, investigationId" });
            return;
        }

        // validate and extract base64
        const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!match) {
            res.status(400).json({ error: "Invalid image data. Must be a base64-encoded data URL." });
            return;
        }

        const format = match[1];
        const allowedFormats = ["jpeg", "jpg", "png", "webp", "gif"];
        if (!allowedFormats.includes(format)) {
            res.status(400).json({ error: `Unsupported image format: ${format}. Allowed: ${allowedFormats.join(", ")}` });
            return;
        }

        const buffer = Buffer.from(match[2], "base64");

        // if larger than 1MB, compress
        let uploadBuffer = buffer;
        if (buffer.length > 1024 * 1024) {
            uploadBuffer = await sharp(buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
        }

        const ext = format === "jpeg" ? "jpg" : format;
        const fileName = `simulation/${crypto.randomUUID()}.${ext}`;
        const bucket = storage.bucket();
        const file = bucket.file(fileName);

        await file.save(uploadBuffer, {
            metadata: { contentType: `image/${format === "jpg" ? "jpeg" : format}` },
        });

        // make publicly readable and get download URL
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // update case document in Firestore
        const caseRef = db.collection("simulations").doc(caseId);
        const caseSnap = await caseRef.get();
        if (!caseSnap.exists) {
            res.status(404).json({ error: "Case not found" });
            return;
        }

        const caseData = caseSnap.data();
        const investigations = (caseData.investigations || []).map((inv) => {
            if (inv.id === investigationId) {
                return { ...inv, imageUrl: publicUrl };
            }
            return inv;
        });
        await caseRef.update({ investigations });

        res.status(200).json({ imageUrl: publicUrl });
    } catch (err) {
        console.error("imageUpload error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});