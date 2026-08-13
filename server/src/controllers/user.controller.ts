import type { Response } from "express";
import { prisma } from "../db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const searchUsers = async (req: AuthedRequest, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 1) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: req.user!.id } },
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 10,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  res.json({ users });
};

export const updateProfile = async (req: AuthedRequest, res: Response) => {
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name ? { name } : {}),
      ...(req.body.avatarUrl ? { avatarUrl: req.body.avatarUrl } : {}),
    },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });

  res.json({ user });
};
