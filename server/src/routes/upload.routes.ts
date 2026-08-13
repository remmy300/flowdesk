import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

router.post("/", upload.single("file"), asyncHandler(uploadImage));

export default router;
