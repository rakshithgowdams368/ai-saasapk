//file path :-ai-saas-antonio-main/components/user-avatar.tsx

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";

export const UserAvatar = ({
  className = "",
  size = "default",
  showStatus = false,
  statusPosition = "bottom-right"
}) => {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [categoryIndex, setCategoryIndex] = useState(0);

  // Category colors matching the landing page
  const categoryColors = [
    "from-purple-500 to-pink-500",     // Image
    "from-blue-500 to-cyan-500",       // Video
    "from-green-500 to-emerald-500",   // Code
    "from-orange-500 to-amber-500",    // Audio
    "from-indigo-500 to-violet-500"    // Conversation
  ];

  useEffect(() => {
    setMounted(true);

    // Only apply animation for premium users
    if (user?.publicMetadata?.plan === "premium" || user?.publicMetadata?.plan === "pro") {
      const interval = setInterval(() => {
        setCategoryIndex(prev => (prev + 1) % categoryColors.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user]);

  if (!mounted || !isLoaded) {
    return (
      <Avatar className={`${getSizeClass(size)} ${className} bg-gray-800 animate-pulse`}>
        <AvatarFallback>
          <User className="text-gray-400" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // Get user's premium status (if any)
  const isPremium = user?.publicMetadata?.plan === "premium" || user?.publicMetadata?.plan === "pro";
  const userInitials = getUserInitials(user);

  // Color gradient based on user status
  const borderGradient = isPremium
    ? `bg-gradient-to-r ${categoryColors[categoryIndex]} p-[2px]`
    : "bg-gray-800 p-[2px]";

  return (
    <div className="relative inline-block">
      {/* Gradient border for premium users */}
      <div className={`${getSizeClass(size, true)} rounded-full ${borderGradient} transition-all duration-1000`}>
        <Avatar className={`${getSizeClass(size)} ${className} bg-gray-900`}>
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} className="object-cover" />
          <AvatarFallback className={`bg-gray-900 font-medium ${isPremium ? 'text-white' : 'text-gray-300'}`}>
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Online status indicator */}
      {showStatus && (
        <span
          className={`absolute ${getStatusPosition(statusPosition)} ${getStatusSize(size)} rounded-full border-2 border-black ${user?.lastActiveAt && isRecentlyActive(user.lastActiveAt) ? 'bg-green-500' : 'bg-gray-500'}`}
        ></span>
      )}
    </div>
  );
};

// Helper functions
function getSizeClass(size, isWrapper = false) {
  const sizes = {
    xs: isWrapper ? "h-7 w-7" : "h-6 w-6",
    sm: isWrapper ? "h-9 w-9" : "h-8 w-8",
    default: isWrapper ? "h-11 w-11" : "h-10 w-10",
    lg: isWrapper ? "h-13 w-13" : "h-12 w-12",
    xl: isWrapper ? "h-17 w-17" : "h-16 w-16"
  };

  return sizes[size] || sizes.default;
}

function getStatusPosition(position) {
  const positions = {
    "top-right": "top-0 right-0 -translate-y-1/4 translate-x-1/4",
    "top-left": "top-0 left-0 -translate-y-1/4 -translate-x-1/4",
    "bottom-right": "bottom-0 right-0 translate-y-1/4 translate-x-1/4",
    "bottom-left": "bottom-0 left-0 translate-y-1/4 -translate-x-1/4"
  };

  return positions[position] || positions["bottom-right"];
}

function getStatusSize(avatarSize) {
  const sizes = {
    xs: "h-2 w-2",
    sm: "h-2.5 w-2.5",
    default: "h-3 w-3",
    lg: "h-3.5 w-3.5",
    xl: "h-4 w-4"
  };

  return sizes[avatarSize] || sizes.default;
}

function getUserInitials(user) {
  if (!user) return "";

  if (user.fullName) {
    const nameParts = user.fullName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  }

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  if (user.firstName) {
    return user.firstName.substring(0, 2).toUpperCase();
  }

  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }

  return "U";
}

function isRecentlyActive(lastActiveAt) {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  return new Date(lastActiveAt) > fiveMinutesAgo;
}

export default UserAvatar;