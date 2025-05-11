// File path: app/(dashboard)/layout.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./dashboard-layout-client";

export default async function ServerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Properly await the auth function in a server component
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Pass children to the client component
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}