import {onRequest} from "firebase-functions/v2/https";
import sharp from "sharp";
import {storage} from "../lib/admin.js";
import {handleCors} from "../lib/cors.js";
import {verifyAdmin} from "../lib/auth.js";

export const imageUpload = onRequest(async (req, res) => {
  try {
    if (handleCors(req, res)) return;
    await verifyAdmin(req);

    const {imageData, caseId, investigationId} = req.body;
    if (!imageData || !caseId || !investigationId) {
      res.status(400).json({error: "Missing required fields: imageData, caseId, investigationId"});
      return;
    }

    const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({error: "Invalid image data. Must be a base64-encoded data URL."});
      return;
    }

    const format = match[1];
    const allowedFormats = ["jpeg", "jpg", "png", "webp", "gif"];
    if (!allowedFormats.includes(format)) {
      res.status(400).json({error: `Unsupported image format: ${format}. Allowed: ${allowedFormats.join(", ")}`});
      return;
    }

    const buffer = Buffer.from(match[2], "base64");

    let uploadBuffer = buffer;
    if (buffer.length > 1024 * 1024) {
      uploadBuffer = await sharp(buffer)
          .resize({width: 1920, withoutEnlargement: true})
          .jpeg({quality: 80})
          .toBuffer();
    }

    const ext = format === "jpeg" ? "jpg" : format;
    const fileName = `simulation/${investigationId}.${ext}`;
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    await file.save(uploadBuffer, {
      metadata: {contentType: `image/${format === "jpg" ? "jpeg" : format}`},
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    res.status(200).json({imageUrl: publicUrl});
  } catch (err) {
    console.error("imageUpload error:", err);
    res.status(500).json({error: err.message || "Internal server error"});
  }
});
