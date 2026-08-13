import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import type { AuthUser } from "../middleware/auth.js";
import type { Prisma } from "@prisma/client";

export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";

export const getMembership = async (projectId: string, userId: string) =>
  prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

export const requireMembership = async (projectId: string, user: AuthUser) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) throw new ApiError(404, "Project not found");
  if (project.ownerId === user.id) {
    return {
      projectId,
      userId: user.id,
      role: "OWNER" as const,
      id: `owner-${user.id}`,
      createdAt: new Date(),
    };
  }
  const membership = await getMembership(projectId, user.id);
  if (!membership) throw new ApiError(403, "You are not a member of this project");
  return membership;
};

export const requireRole = async (
  projectId: string,
  user: AuthUser,
  allowed: MembershipRole[]
) => {
  const membership = await requireMembership(projectId, user);
  if (!allowed.includes(membership.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return membership;
};

export const logActivity = (
  projectId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>
) =>
  prisma.activityLog.create({
    data: {
      projectId,
      userId,
      action,
      details: details as Prisma.InputJsonValue | undefined,
    },
  });
