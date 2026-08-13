import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import {
  listTasks,
  createTask,
} from "../controllers/task.controller.js";
import {
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from "../controllers/member.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/error.js";
import {
  projectSchema,
  projectParams,
  projectIdParams,
  taskSchema,
  memberSchema,
  memberParams,
  updateMemberRoleSchema,
} from "../lib/validation.js";

const router = Router();

router.get("/", asyncHandler(listProjects));
router.post("/", validate(projectSchema), asyncHandler(createProject));

router.get("/:id", validate(projectParams), asyncHandler(getProject));
router.patch(
  "/:id",
  validate(projectParams),
  validate(projectSchema.partial()),
  asyncHandler(updateProject)
);
router.delete("/:id", validate(projectParams), asyncHandler(deleteProject));

router.get("/:projectId/members", validate(projectIdParams), asyncHandler(listMembers));
router.post(
  "/:projectId/members",
  validate(projectIdParams),
  validate(memberSchema),
  asyncHandler(addMember)
);
router.patch(
  "/:projectId/members/:userId",
  validate(memberParams),
  validate(updateMemberRoleSchema),
  asyncHandler(updateMemberRole)
);
router.delete("/:projectId/members/:userId", validate(memberParams), asyncHandler(removeMember));

router.get("/:projectId/tasks", asyncHandler(listTasks));
router.post("/:projectId/tasks", validate(taskSchema), asyncHandler(createTask));

export default router;
