// File path: app/(dashboard)/dashboard-layout-client.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/mobile-sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="h-full relative bg-black">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-gray-900 border border-gray-800 hover:bg-gray-800"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50 bg-gray-900/95 backdrop-blur-lg border-r border-gray-800">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="text-white">✕</span>
          </Button>
        </div>
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="md:pl-72 h-full">
        <Navbar />
        <div className="h-[calc(100vh-64px)] overflow-auto bg-black">
          <div className="h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayoutClient;