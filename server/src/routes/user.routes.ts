import { Router } from "express";
import { searchUsers, updateProfile } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/error.js";
import { updateProfileSchema } from "../lib/validation.js";

const router = Router();

router.get("/search", asyncHandler(searchUsers));
router.patch("/profile", validate(updateProfileSchema), asyncHandler(updateProfile));

export default router;
