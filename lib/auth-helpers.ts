// lib/auth-helpers.ts
import { auth } from "@clerk/nextjs";

export async function getAuthenticatedUserId() {
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  return userId;
}