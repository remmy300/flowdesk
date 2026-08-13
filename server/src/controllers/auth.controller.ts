import type { Response } from "express";
import { prisma } from "../db.js";
import { clearAuthCookie, type AuthedRequest } from "../middleware/auth.js";

export const logout = async (_req: AuthedRequest, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};

export const me = async (req: AuthedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true },
  });
  res.json({ user });
};
