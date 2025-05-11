//file path :-ai-saas-antonio-main/components/empty.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

interface EmptyProps {
  label: string;
  icon?: React.ReactNode;
  type?: "image" | "video" | "code" | "audio" | "conversation" | "default";
}

export const Empty = ({
  label,
  icon,
  type = "default"
}: EmptyProps) => {
  const [mounted, setMounted] = useState(false);

  // Gradient variants that match landing page
  const gradientClasses = {
    default: "from-purple-500 to-blue-500",
    image: "from-purple-500 to-pink-500",
    video: "from-blue-500 to-cyan-500",
    code: "from-green-500 to-emerald-500",
    audio: "from-orange-500 to-amber-500",
    conversation: "from-indigo-500 to-violet-500"
  };

  // Get the gradient based on type
  const gradient = gradientClasses[type];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full p-8 md:p-20 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full`}></div>

        {/* Image container with grid overlay */}
        <div className="relative h-52 w-52 md:h-72 md:w-72 flex items-center justify-center">
          <Image
            alt="Empty"
            src="/empty.png"
            fill
            className="object-contain z-10"
            priority
            onError={(e) => {
              // If image fails to load, show fallback
              e.currentTarget.style.display = 'none';
              document.getElementById('empty-fallback')?.classList.remove('hidden');
            }}
          />

          {/* Fallback icon */}
          <div id="empty-fallback" className="hidden z-10">
            {icon || (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <LayoutGrid className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Grid pattern overlay to match landing page style */}
          <div className="absolute inset-0 z-0" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>

      {/* Label with gradient text */}
      <div className="mt-8 text-center max-w-sm">
        <p className="text-gray-300 text-sm md:text-base">{label}</p>

        {/* Optional animated hint */}
        <div className="mt-6 opacity-0 animate-fade-in-delayed">
          <div className={`inline-block bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-xs px-3 py-1 rounded-full border border-gray-800`}>
            Try a different prompt
          </div>
        </div>
      </div>

      {/* Add the keyframes for delayed fade in */}
      <style jsx global>{`
        @keyframes fade-in-delayed {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 0.8;
          }
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 3s forwards;
        }
      `}</style>
    </div>
  );
};

export default Empty;