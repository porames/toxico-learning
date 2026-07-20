import {onRequest} from "firebase-functions/v2/https";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";

const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;

export const getVideoUploadUrl = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
        {
          method: "POST",
          headers: {
            "AccessKey": BUNNY_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({title: crypto.randomUUID()}),
        },
    );
    if (!bunnyRes.ok) {
      const text = await bunnyRes.text();
      throw new Error(`Bunny API error: ${text}`);
    }
    const response = await bunnyRes.json();

    res.status(200).json({
      apiKey: BUNNY_API_KEY,
      libraryId: BUNNY_LIBRARY_ID,
      videoId: response.guid,
    });
  } catch (err) {
    console.error("getVideoUploadUrl error:", err);
    res.status(500).json({error: err.message || "Internal server error"});
  }
});

export const getVideoPlaybackUrl = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }
    const idToken = authHeader.split("Bearer ")[1];
    await admin.auth().verifyIdToken(idToken);

    const {videoId} = req.body;
    if (!videoId) {
      res.status(400).json({error: "videoId is required"});
      return;
    }

    const token = jwt.sign(
        {id: videoId, exp: Math.floor(Date.now() / 1000) + 3600},
        BUNNY_API_KEY,
        {algorithm: "HS256"},
    );

    const embedUrl =
      `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?token=${token}`;
    res.status(200).json({embedUrl});
  } catch (err) {
    console.error("getVideoPlaybackUrl error:", err);
    res.status(500).json({error: err.message || "Internal server error"});
  }
});

export const deleteVideo = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {videoId} = req.body;
    if (!videoId) {
      res.status(400).json({error: "videoId is required"});
      return;
    }

    const bunnyRes = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {"AccessKey": BUNNY_API_KEY},
        },
    );
    if (!bunnyRes.ok) {
      const text = await bunnyRes.text();
      throw new Error(`Bunny API error: ${text}`);
    }

    res.status(200).json({success: true});
  } catch (err) {
    console.error("deleteVideo error:", err);
    res.status(500).json({error: err.message || "Internal server error"});
  }
});
