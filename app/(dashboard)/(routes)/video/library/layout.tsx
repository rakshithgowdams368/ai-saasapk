// File path: app/(dashboard)/(routes)/video/library/layout.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function VideoLibraryLayout({
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