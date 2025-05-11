// File path: app/(dashboard)/(routes)/video/layout.tsx

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  return <>{children}</>;
}