import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { ApiError } from "./error.js";
import { resolveClerkUser, verifyClerkToken } from "../lib/clerk.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

interface TokenPayload {
  sub: string;
}

export const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "lax" });
};

export const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = req.cookies?.token;
  return cookie ?? null;
};

export const requireAuth = async (
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, "Authentication required");

    // 1) Preferred: a Clerk session token from the frontend.
    const clerkId = await verifyClerkToken(token);
    if (clerkId) {
      try {
        req.user = await resolveClerkUser(clerkId);
      } catch {
        throw new ApiError(401, "Could not resolve Clerk account");
      }
      return next();
    }

    // 2) Fallback: the legacy self-signed JWT (Google login / older sessions).
    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    });

    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
