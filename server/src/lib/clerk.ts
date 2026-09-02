import { createClerkClient, verifyToken } from "@clerk/backend";
import { config } from "../config.js";
import { prisma } from "../db.js";
import type { AuthUser } from "../middleware/auth.js";

/**
 * Clerk integration.
 *
 * The frontend (Clerk) mints a short-lived session JWT. We verify that JWT here
 * with Clerk's public keys (fetched + cached by `verifyToken`), then look up the
 * full Clerk user to sync a local `User` row. Everything downstream keeps using
 * the local `User` (its cuid `id`, `role`, etc.), so no other code changes.
 */

export const isClerkConfigured = () => Boolean(config.clerk.secretKey);

const clerkClient = config.clerk.secretKey
  ? createClerkClient({ secretKey: config.clerk.secretKey })
  : null;

/** Verify a Clerk session token. Returns the `sub` (Clerk user id) or null. */
export const verifyClerkToken = async (token: string): Promise<string | null> => {
  if (!config.clerk.secretKey) return null;
  try {
    const claims = await verifyToken(token, {
      secretKey: config.clerk.secretKey,
      authorizedParties: config.clerk.authorizedParties.length
        ? config.clerk.authorizedParties
        : undefined,
    });
    return claims.sub ?? null;
  } catch {
    return null;
  }
};

/**
 * Find-or-create the local `User` for a verified Clerk id.
 * Links to any pre-existing account that shares the same email (so users who
 * previously signed in with Google keep their projects/tasks).
 */
export const resolveClerkUser = async (clerkId: string): Promise<AuthUser> => {
  if (!clerkClient) throw new Error("Clerk is not configured");

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) throw new Error("Clerk account has no email address");

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email.split("@")[0];
  const avatarUrl = clerkUser.imageUrl || null;

  // 1) Already linked by clerkId.
  const linked = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });
  if (linked) return linked;

  // 2) Pre-existing account with the same email -> attach clerkId.
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId, avatarUrl: byEmail.avatarUrl ?? avatarUrl },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    });
  }

  // 3) Brand new user.
  return prisma.user.create({
    data: { clerkId, email, name, avatarUrl },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });
};
