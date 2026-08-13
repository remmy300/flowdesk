import type { Response } from "express";
import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireRole, logActivity } from "../lib/project-access.js";

const taskInclude = {
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  createdBy: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export const listTasks = async (req: AuthedRequest, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  const status = req.query.status as string | undefined;
  const assigneeId = req.query.assigneeId as string | undefined;

  const tasks = await prisma.task.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(status ? { status: status as TaskStatusValue } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      project: {
        OR: [
          { ownerId: req.user!.id },
          { members: { some: { userId: req.user!.id } } },
        ],
      },
    },
    include: {
      ...taskInclude,
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
  });

  res.json({ tasks });
};

type TaskStatusValue = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export const getTask = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      ...taskInclude,
      project: { select: { id: true, name: true, color: true, ownerId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!task) throw new ApiError(404, "Task not found");

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: task.projectId, userId: req.user!.id },
    },
  });
  if (task.project.ownerId !== req.user!.id && !membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  res.json({ task });
};

export const createTask = async (req: AuthedRequest, res: Response) => {
  const { title, description, status, priority, assigneeId, dueDate, position } = req.body;
  const { projectId } = req.params;

  await requireRole(projectId, req.user!, ["OWNER", "ADMIN", "MEMBER"]);
  if (assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: assigneeId } },
    });
    if (!isMember) throw new ApiError(400, "Assignee must be a project member");
  }

  const count = await prisma.task.count({ where: { projectId } });

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      position: position ?? count,
      dueDate: dueDate ?? null,
      projectId,
      assigneeId: assigneeId ?? null,
      createdById: req.user!.id,
    },
    include: taskInclude,
  });

  await logActivity(projectId, req.user!.id, "TASK_CREATED", { title });
  res.status(201).json({ task });
};

export const updateTask = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, assigneeId, dueDate, position } = req.body;

  const existing = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!existing) throw new ApiError(404, "Task not found");

  await requireRole(existing.projectId, req.user!, ["OWNER", "ADMIN", "MEMBER"]);

  if (assigneeId && assigneeId !== existing.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: existing.projectId, userId: assigneeId } },
    });
    if (!isMember) throw new ApiError(400, "Assignee must be a project member");
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title ?? undefined,
      description: description !== undefined ? description : undefined,
      status: status ?? undefined,
      priority: priority ?? undefined,
      assigneeId: assigneeId !== undefined ? assigneeId : undefined,
      dueDate: dueDate !== undefined ? dueDate : undefined,
      position: position ?? undefined,
    },
    include: taskInclude,
  });

  await logActivity(existing.projectId, req.user!.id, "TASK_UPDATED", {
    title: task.title,
    changes: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assigneeId !== undefined && assigneeId !== existing.assigneeId ? { assigneeId } : {}),
    },
  });

  res.json({ task });
};

export const moveTask = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const { status, position } = req.body;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Task not found");

  await requireRole(existing.projectId, req.user!, ["OWNER", "ADMIN", "MEMBER"]);

  const task = await prisma.$transaction(async (tx) => {
    const sameStatus = await tx.task.findMany({
      where: { projectId: existing.projectId, status, id: { not: id } },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    let newPos = position;
    if (position >= sameStatus.length) newPos = sameStatus.length;

    await tx.task.updateMany({
      where: { projectId: existing.projectId, status, position: { gte: newPos } },
      data: { position: { increment: 1 } },
    });

    return tx.task.update({
      where: { id },
      data: { status, position: newPos },
      include: taskInclude,
    });
  });

  await logActivity(existing.projectId, req.user!.id, "TASK_MOVED", {
    title: task.title,
    from: existing.status,
    to: status,
  });

  res.json({ task });
};

export const deleteTask = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Task not found");

  await requireRole(existing.projectId, req.user!, ["OWNER", "ADMIN"]);

  await prisma.task.delete({ where: { id } });
  await logActivity(existing.projectId, req.user!.id, "TASK_DELETED", {
    title: existing.title,
  });

  res.json({ message: "Task deleted" });
};
