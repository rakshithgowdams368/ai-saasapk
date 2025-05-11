//file path :-ai-saas-antonio-main/components/ui/dropdown-menu.tsx
"use client";

import { useState } from "react";
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const UserProfileDropdown = ({ user, activeCategory, getCategoryColor }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    
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
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 hover:bg-gray-800 p-1 pr-2 rounded-full"
      >
        {/* Gradient border for avatar */}
        <div className={`p-[2px] rounded-full bg-gradient-to-r ${getCategoryColor(activeCategory)}`}>
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt={user.fullName || "User"} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <span className="text-white">{getUserInitials()}</span>
            )}
          </div>
        </div>
        <span className="text-white hidden md:inline">
          {user?.fullName || user?.username || "User"}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {isDropdownOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-xl border border-gray-700 shadow-lg z-50"
          onBlur={() => setIsDropdownOpen(false)}
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-700 flex items-center gap-3">
            <div className={`p-[2px] rounded-full bg-gradient-to-r ${getCategoryColor(activeCategory)}`}>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || "User"} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <span className="text-white">{getUserInitials()}</span>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-white">{user?.fullName || user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email || "user@example.com"}</p>
            </div>
          </div>

          {/* Dropdown Menu Items */}
          <div className="py-1">
            <button 
              onClick={() => {
                // Handle profile navigation
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-white text-sm"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </button>
            <button 
              onClick={() => {
                // Handle settings navigation
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-white text-sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </button>
            <button 
              onClick={() => {
                // Handle billing navigation
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-white text-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </button>
            <button 
              onClick={() => {
                // Handle logout
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-red-400 text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;