import multer from "multer";
import { ApiError } from "./error.js";

const storage = multer.memoryStorage();

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
]);

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.has(file.mimetype)) cb(null, true);
    else cb(new ApiError(400, "File type not allowed"));
  },
});
