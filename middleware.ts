// File path: middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
    "/pricing"
  ],
});

export const config = {
  matcher: ["/((?!.*\\.[^/]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};