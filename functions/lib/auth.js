import {admin, db} from "./admin.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const snap = await db
      .collection("users")
      .where("authId", "==", decodedToken.uid)
      .get();

  if (snap.empty || snap.docs[0].data().role !== "admin") {
    throw new HttpError(403, "Forbidden");
  }

  return {uid: decodedToken.uid, ...snap.docs[0].data()};
}

export async function verifyUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const snap = await db
      .collection("users")
      .where("authId", "==", decodedToken.uid)
      .get();

  if (snap.empty) {
    throw new HttpError(403, "Forbidden");
  }

  return {uid: decodedToken.uid, ...snap.docs[0].data()};
}
