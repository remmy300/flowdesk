import { Router } from "express";
import { updateComment, deleteComment } from "../controllers/comment.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/error.js";
import { commentSchema } from "../lib/validation.js";
import { z } from "zod";

const router = Router();

const commentParams = z.object({
  params: z.object({ id: z.string().cuid() }),
});

router.patch("/:id", validate(commentParams), validate(commentSchema), asyncHandler(updateComment));
router.delete("/:id", validate(commentParams), asyncHandler(deleteComment));

export default router;
