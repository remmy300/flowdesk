import { OAuth2Client } from "google-auth-library";
import type { Response } from "express";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { ApiError } from "../middleware/error.js";
import { setAuthCookie, signToken, type AuthedRequest } from "../middleware/auth.js";

const client = new OAuth2Client();

export const googleLogin = async (req: AuthedRequest, res: Response) => {
  if (!config.google.clientId) {
    throw new ApiError(500, "Google OAuth is not configured on the server");
  }

  const { idToken } = req.body;

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
  } catch {
    throw new ApiError(401, "Invalid Google credential");
  }

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new ApiError(400, "Google account has no email address");
  }

  const email = payload.email;
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      googleId: payload.sub,
      name: payload.name ?? undefined,
      avatarUrl: payload.picture ?? undefined,
    },
    create: {
      email,
      googleId: payload.sub,
      name: payload.name ?? email.split("@")[0],
      avatarUrl: payload.picture ?? null,
    },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });

  setAuthCookie(res, signToken(user.id));
  res.json({ user });
};
