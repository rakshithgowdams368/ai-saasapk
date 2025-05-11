//file path :-ai-saas-antonio-main/components/bot-avatar.tsx
"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { LayoutGrid } from "lucide-react";

type SizeType = "sm" | "default" | "lg" | "xl";
type GradientType = "default" | "image" | "video" | "code" | "audio" | "conversation";

interface BotAvatarProps {
  size?: SizeType;
  pulse?: boolean;
  gradient?: GradientType;
}

// Enhanced BotAvatar component that matches the landing page styling
export const BotAvatar = ({
  size = "default",
  pulse = false,
  gradient = "default"
}: BotAvatarProps) => {
  const [mounted, setMounted] = useState(false);

  // Size variants
  const sizeClasses: Record<SizeType, string> = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12"
  };

  // Gradient variants that match landing page
  const gradientClasses: Record<GradientType, string> = {
    default: "bg-gradient-to-br from-purple-500 to-blue-500",
    image: "bg-gradient-to-br from-purple-500 to-pink-500",
    video: "bg-gradient-to-br from-blue-500 to-cyan-500",
    code: "bg-gradient-to-br from-green-500 to-emerald-500",
    audio: "bg-gradient-to-br from-orange-500 to-amber-500",
    conversation: "bg-gradient-to-br from-indigo-500 to-violet-500"
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`relative ${pulse ? 'animate-pulse' : ''}`}>
      <Avatar className={`${sizeClasses[size]} p-0.5 ${gradientClasses[gradient]}`}>
        <div className="h-full w-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
          <AvatarImage
            src="/logo.png"
            alt="AI"
            className="p-1"
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.currentTarget.style.display = 'none';
              document.getElementById('fallback-icon')?.classList.remove('hidden');
            }}
          />
          <div id="fallback-icon" className="hidden">
            <LayoutGrid className={`text-white ${size === 'sm' ? 'w-3 h-3' :
                size === 'lg' ? 'w-5 h-5' :
                  size === 'xl' ? 'w-6 h-6' :
                    'w-4 h-4'
              }`} />
          </div>
        </div>
      </Avatar>

      {/* Grid pattern overlay to match landing page style */}
      <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '4px 4px'
      }}></div>
    </div>
  );
};

export default BotAvatar;