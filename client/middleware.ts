import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk middleware. It only *populates* auth state (so `auth()` / Clerk hooks
 * work); it does NOT force sign-in on any route. Route protection stays in the
 * existing React guards (`RequireAuth` / `RedirectIfAuthed`), so behaviour is
 * unchanged for users who aren't signed in.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
