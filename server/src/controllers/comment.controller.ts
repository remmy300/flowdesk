import type { Response } from "express";
import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireRole, logActivity } from "../lib/project-access.js";

export const listComments = async (req: AuthedRequest, res: Response) => {
  const { taskId } = req.params;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: req.user!.id } },
  });
  const project = await prisma.project.findUnique({ where: { id: task.projectId } });
  if (project?.ownerId !== req.user!.id && !membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.json({ comments });
};

export const createComment = async (req: AuthedRequest, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");

  await requireRole(task.projectId, req.user!, ["OWNER", "ADMIN", "MEMBER"]);

  const comment = await prisma.comment.create({
    data: { content, taskId, authorId: req.user!.id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  await logActivity(task.projectId, req.user!.id, "COMMENT_ADDED", { taskId });
  res.status(201).json({ comment });
};

export const updateComment = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new ApiError(404, "Comment not found");
  if (comment.authorId !== req.user!.id) {
    throw new ApiError(403, "You can only edit your own comments");
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.json({ comment: updated });
};

export const deleteComment = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new ApiError(404, "Comment not found");

  const task = await prisma.task.findUnique({ where: { id: comment.taskId } });
  const project = task
    ? await prisma.project.findUnique({ where: { id: task.projectId } })
    : null;

  if (comment.authorId !== req.user!.id && project?.ownerId !== req.user!.id) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await prisma.comment.delete({ where: { id } });
  res.json({ message: "Comment deleted" });
};
