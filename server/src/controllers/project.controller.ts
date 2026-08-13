import type { Response } from "express";
import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/project-access.js";

const projectSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
} as const;

export const listProjects = async (req: AuthedRequest, res: Response) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: req.user!.id },
        { members: { some: { userId: req.user!.id } } },
      ],
    },
    select: {
      ...projectSelect,
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      members: {
        select: {
          role: true,
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const withProgress = await Promise.all(
    projects.map(async (project) => {
      const total = await prisma.task.count({ where: { projectId: project.id } });
      const done = await prisma.task.count({
        where: { projectId: project.id, status: "DONE" },
      });
      return {
        ...project,
        taskCount: total,
        completedTaskCount: done,
        progress: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    })
  );

  res.json({ projects: withProgress });
};

export const getProject = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: req.user!.id } },
  });

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      ...projectSelect,
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      members: {
        select: {
          role: true,
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!project) throw new ApiError(404, "Project not found");
  if (project.ownerId !== req.user!.id && !membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const [taskCount, doneCount, activityLogs] = await Promise.all([
    prisma.task.count({ where: { projectId: id } }),
    prisma.task.count({ where: { projectId: id, status: "DONE" } }),
    prisma.activityLog.findMany({
      where: { projectId: id },
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
  ]);

  res.json({
    project: {
      ...project,
      taskCount,
      completedTaskCount: doneCount,
      progress: taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100),
      activityLogs,
    },
  });
};

export const createProject = async (req: AuthedRequest, res: Response) => {
  const { name, description, color } = req.body;

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      color: color ?? "#6366f1",
      ownerId: req.user!.id,
    },
    select: projectSelect,
  });

  await prisma.projectMember.create({
    data: { projectId: project.id, userId: req.user!.id, role: "OWNER" },
  });
  await logActivity(project.id, req.user!.id, "PROJECT_CREATED", { name });

  res.status(201).json({ project });
};

export const updateProject = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, color, status } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError(404, "Project not found");
  if (project.ownerId !== req.user!.id) {
    throw new ApiError(403, "Only the project owner can edit the project");
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: name ?? undefined,
      description: description !== undefined ? description : undefined,
      color: color ?? undefined,
      status: status ?? undefined,
    },
    select: projectSelect,
  });

  await logActivity(id, req.user!.id, "PROJECT_UPDATED", { name: updated.name });
  res.json({ project: updated });
};

export const deleteProject = async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ApiError(404, "Project not found");
  if (project.ownerId !== req.user!.id) {
    throw new ApiError(403, "Only the project owner can delete the project");
  }

  await prisma.project.delete({ where: { id } });
  res.json({ message: "Project deleted" });
};
