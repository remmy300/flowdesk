import type { Response } from "express";
import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/project-access.js";

export const listMembers = async (req: AuthedRequest, res: Response) => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new ApiError(404, "Project not found");

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user!.id } },
  });
  if (project.ownerId !== req.user!.id && !membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  res.json({ members });
};

export const addMember = async (req: AuthedRequest, res: Response) => {
  const { projectId } = req.params;
  const { email, role } = req.body;

  const owner = await prisma.project.findUnique({ where: { id: projectId } });
  if (!owner) throw new ApiError(404, "Project not found");
  if (owner.ownerId !== req.user!.id) {
    throw new ApiError(403, "Only the project owner can add members");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "No user found with that email");
  if (user.id === owner.ownerId) throw new ApiError(400, "The owner is already a member");

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) throw new ApiError(409, "User is already a member");

  const member = await prisma.projectMember.create({
    data: { projectId, userId: user.id, role: role ?? "MEMBER" },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  await logActivity(projectId, req.user!.id, "MEMBER_ADDED", {
    name: user.name,
    role: role ?? "MEMBER",
  });

  res.status(201).json({ member });
};

export const updateMemberRole = async (req: AuthedRequest, res: Response) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const owner = await prisma.project.findUnique({ where: { id: projectId } });
  if (!owner) throw new ApiError(404, "Project not found");
  if (owner.ownerId !== req.user!.id) {
    throw new ApiError(403, "Only the project owner can change roles");
  }
  if (userId === owner.ownerId) throw new ApiError(400, "Cannot change the owner's role");

  const member = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  await logActivity(projectId, req.user!.id, "MEMBER_ROLE_CHANGED", {
    name: member.user.name,
    role,
  });

  res.json({ member });
};

export const removeMember = async (req: AuthedRequest, res: Response) => {
  const { projectId, userId } = req.params;

  const owner = await prisma.project.findUnique({ where: { id: projectId } });
  if (!owner) throw new ApiError(404, "Project not found");
  if (owner.ownerId !== req.user!.id) {
    throw new ApiError(403, "Only the project owner can remove members");
  }
  if (userId === owner.ownerId) throw new ApiError(400, "The owner cannot be removed");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw new ApiError(404, "Member not found");

  await prisma.projectMember.delete({ where: { id: member.id } });
  await logActivity(projectId, req.user!.id, "MEMBER_REMOVED", { userId });

  res.json({ message: "Member removed" });
};
