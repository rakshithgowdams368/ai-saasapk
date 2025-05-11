//file path :-ai-saas-antonio-main/components/heading.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/sidebar";

const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("image");

  // Categories that match landing page
  const categories = ["image", "video", "code", "audio", "conversation"];

  // Category color mapping from landing page
  const getCategoryColor = (category: string) => {
    if (category === "image") return "from-purple-500 to-pink-500";
    if (category === "video") return "from-blue-500 to-cyan-500";
    if (category === "code") return "from-green-500 to-emerald-500";
    if (category === "audio") return "from-orange-500 to-amber-500";
    if (category === "conversation") return "from-indigo-500 to-violet-500";
    return "from-gray-500 to-gray-700";
  };

  useEffect(() => {
    setIsMounted(true);

    // Rotate through categories for the button styling
    const interval = setInterval(() => {
      setCurrentCategory(prev => {
        const currentIndex = categories.indexOf(prev);
        return categories[(currentIndex + 1) % categories.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden relative overflow-hidden group"
          onClick={() => setIsOpen(true)}
        >
          {/* Animated background gradient based on category */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(currentCategory)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

          {/* Icon that changes on hover */}
          <Menu className="absolute inset-0 m-auto transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
          <div className="absolute inset-0 m-auto scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
            <Menu className="absolute inset-0 m-auto" strokeWidth={3} />
          </div>

          {/* Grid pattern overlay to match landing page design */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '4px 4px'
          }}></div>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="p-0 border-r border-gray-800 bg-black"
        onCloseAutoFocus={() => setIsOpen(false)}
      >
        {/* Custom close button that matches the landing page style */}
        <div className="absolute right-4 top-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-full w-8 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;