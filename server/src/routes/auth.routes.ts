import { Router } from "express";
import { logout, me } from "../controllers/auth.controller.js";
import { googleLogin } from "../controllers/google-auth.controller.js";
import { validate } from "../middleware/validate.js";
import { googleLoginSchema } from "../lib/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();

router.post("/google", validate(googleLoginSchema), asyncHandler(googleLogin));
router.post("/logout", requireAuth, asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
