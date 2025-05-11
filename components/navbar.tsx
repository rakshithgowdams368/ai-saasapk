"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

// Create custom components instead of using imports that might be missing
const Button = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  onClick = () => {} 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
  };
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10 rounded-full",
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Simple dropdown component
const DropdownMenu = ({ children, open, onOpenChange }) => {
  return open ? children : null;
};

const DropdownMenuTrigger = ({ asChild, children }) => {
  return children;
};

const DropdownMenuContent = ({ className = "", children }) => {
  return (
    <div className={`z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({ className = "", children }) => {
  return <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>{children}</div>;
};

const DropdownMenuSeparator = ({ className = "" }) => {
  return <div className={`-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800 ${className}`} />;
};

const DropdownMenuGroup = ({ className = "", children }) => {
  return <div className={className}>{children}</div>;
};

const DropdownMenuItem = ({ className = "", children }) => {
  return (
    <div className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50 ${className}`}>
      {children}
    </div>
  );
};

// Add CSS for the shake animation
const ShakeAnimation = () => (
  <style jsx global>{`
    @keyframes shake {
      0% { transform: translateX(0); }
      10% { transform: translateX(-2px) rotate(-1deg); }
      20% { transform: translateX(2px) rotate(1deg); }
      30% { transform: translateX(-2px) rotate(-1deg); }
      40% { transform: translateX(2px) rotate(1deg); }
      50% { transform: translateX(-2px) rotate(-1deg); }
      60% { transform: translateX(2px) rotate(1deg); }
      70% { transform: translateX(-2px) rotate(-1deg); }
      80% { transform: translateX(1px) rotate(0); }
      90% { transform: translateX(-1px) rotate(0); }
      100% { transform: translateX(0); }
    }
    
    .animate-shake {
      animation: shake 1s ease-in-out;
    }
  `}</style>
);

const Navbar = () => {
  const { user } = useUser();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  // Define notification messages
  const notifications = [
    {
      id: 1,
      title: "AI Code Generation",
      message: "This website allows you to generate complex code in multiple programming languages using our advanced AI models.",
      time: "Just now",
      isNew: true,
    },
    {
      id: 2,
      title: "Video Creation",
      message: "Create stunning videos with just a text prompt. Our AI can generate animations, motion graphics, and visual effects.",
      time: "5 minutes ago",
      isNew: true,
    },
    {
      id: 3,
      title: "Audio Generation",
      message: "Transform text into natural-sounding speech or create custom music and sound effects with our audio generation tools.",
      time: "20 minutes ago",
      isNew: true,
    },
    {
      id: 4,
      title: "Image Synthesis",
      message: "Generate photorealistic images or artistic illustrations based on your descriptions with our state-of-the-art image models.",
      time: "1 hour ago",
      isNew: false,
    },
    {
      id: 5,
      title: "AI Assistant",
      message: "Get help with your tasks using our conversational AI assistant that can answer questions and provide guidance.",
      time: "2 hours ago",
      isNew: false,
    },
    {
      id: 6,
      title: "New Templates Available",
      message: "We've added 50+ new templates for code, design, and content creation to help you work more efficiently.",
      time: "Yesterday",
      isNew: false,
    }
  ];

  // Add notification shaking effect every 2 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 2000);
    }, 120000); // 2 minutes in milliseconds
    
    // Initial shake after component mounts
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <ShakeAnimation />
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-800/50 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 px-4 md:px-6">
        
        

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          {/* Notifications Dropdown */}
          <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`relative text-slate-400 hover:text-white transition-all ${isShaking ? 'animate-shake' : ''}`}
                onClick={() => setIsNotificationOpen(prev => !prev)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-xs text-white flex items-center justify-center">
                  6
                </span>
              </Button>
            </DropdownMenuTrigger>
            {isNotificationOpen && (
              <div className="absolute z-50 top-16 right-4 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-md shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                  <span className="text-white font-medium">Notifications</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                    onClick={() => setIsNotificationOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50">
                      <div className="flex items-start gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center mt-0.5 ${
                          notification.isNew ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-800'
                        }`}>
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white">{notification.title}</p>
                            <span className="text-xs text-slate-500">{notification.time}</span>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-2">{notification.message}</p>
                        </div>
                        {notification.isNew && (
                          <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-800">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </DropdownMenu>

          {/* User Section */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-slate-400">
                {user?.emailAddresses?.[0]?.emailAddress || "user@example.com"}
              </p>
            </div>
            {user ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-purple-500/30"
                  }
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-purple-500/30">
                <span className="text-white font-medium text-xs">U</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;