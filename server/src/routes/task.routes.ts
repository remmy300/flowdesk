import { Router } from "express";
import {
  getTask,
  listTasks,
  updateTask,
  moveTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { listComments, createComment } from "../controllers/comment.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/error.js";
import {
  taskParams,
  taskIdParams,
  taskSchema,
  taskMoveSchema,
  commentSchema,
} from "../lib/validation.js";

const router = Router();

router.get("/", asyncHandler(listTasks));

router.get("/:id", validate(taskParams), asyncHandler(getTask));
router.patch("/:id", validate(taskParams), validate(taskSchema), asyncHandler(updateTask));
router.post("/:id/move", validate(taskParams), validate(taskMoveSchema), asyncHandler(moveTask));
router.delete("/:id", validate(taskParams), asyncHandler(deleteTask));

router.get("/:taskId/comments", validate(taskIdParams), asyncHandler(listComments));
router.post(
  "/:taskId/comments",
  validate(taskIdParams),
  validate(commentSchema),
  asyncHandler(createComment)
);

export default router;
