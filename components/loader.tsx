//file path :-ai-saas-antonio-main/components/loader.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

export const Loader = () => {
  const [loadingText, setLoadingText] = useState("NexusAI is thinking");
  const [currentCategory, setCurrentCategory] = useState(0);

  // Categories with their respective colors - matching the landing page
  const categories = [
    { name: "Image", color: "from-purple-500 to-pink-500" },
    { name: "Video", color: "from-blue-500 to-cyan-500" },
    { name: "Code", color: "from-green-500 to-emerald-500" },
    { name: "Audio", color: "from-orange-500 to-amber-500" },
    { name: "Conversation", color: "from-indigo-500 to-violet-500" }
  ];

  // Rotate through loading text variations
  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingText(current => {
        const dots = current.match(/\.+$/)?.[0] || "";
        const baseText = "NexusAI is thinking";

        if (dots.length >= 3) {
          return baseText;
        } else {
          return baseText + dots + ".";
        }
      });
    }, 500);

    // Rotate through categories
    const categoryInterval = setInterval(() => {
      setCurrentCategory(prev => (prev + 1) % categories.length);
    }, 2000);

    return () => {
      clearInterval(textInterval);
      clearInterval(categoryInterval);
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${categories[currentCategory].color} opacity-10 blur-3xl transition-all duration-1000`}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 rounded-full border-4 border-gray-800 flex items-center justify-center p-1">
            {/* Middle ring with gradient */}
            <div className={`w-full h-full rounded-full border-2 border-transparent bg-gradient-to-r ${categories[currentCategory].color} bg-clip-border p-1 animate-pulse`}>
              {/* Inner circle with logo */}
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <div className="w-12 h-12 relative animate-spin">
                  {/* If you have a logo.png file */}
                  <Image
                    alt="logo"
                    fill
                    src="/logo.png"
                    className="object-contain"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      document.getElementById('fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback icon in case image fails */}
                  <div id="fallback-icon" className="hidden absolute inset-0 flex items-center justify-center">
                    <LayoutGrid className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full bg-gradient-to-r ${categories[currentCategory].color}`}
              style={{
                animation: `orbit 3s linear infinite`,
                animationDelay: `${i * 0.6}s`,
                transformOrigin: 'center',
                left: 'calc(50% - 6px)',
                top: 'calc(50% - 6px)'
              }}
            ></div>
          ))}
        </div>

        {/* Text */}
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-white">{loadingText}</p>
          <p className="text-sm text-gray-400 mt-2">Generating {categories[currentCategory].name.toLowerCase()} content</p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${categories[currentCategory].color} animate-progress-indeterminate`}></div>
        </div>
      </div>

      {/* Add the keyframes for the animations */}
      <style jsx global>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(32px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(32px) rotate(-360deg);
          }
        }
        
        @keyframes progress-indeterminate {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 0%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;