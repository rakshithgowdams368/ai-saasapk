"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  Code,
  Settings,
  CreditCard
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500"
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image-2",
    color: "text-pink-500",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
  },
  {
    label: "Audio Generation",
    icon: Music,
    href: "/audio",
    color: "text-emerald-500",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
  },
  {
    label: "Pricing",
    icon: CreditCard,
    href: "/upgrade",
  },
];

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  
  return (
    <div className={cn("flex flex-col h-full bg-slate-800", className)}>
      <div className="py-4 flex justify-center border-b border-gray-700">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative w-12 h-12 mr-2">
            <Image
              fill
              src="/logo.png"
              alt="Logo"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">5ModleAI</h1>
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center py-3 px-4 text-sm rounded-lg transition-all hover:bg-slate-700 hover:text-white",
              pathname === route.href
                ? "bg-slate-700 text-white"
                : "text-gray-300",
            )}
          >
            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;