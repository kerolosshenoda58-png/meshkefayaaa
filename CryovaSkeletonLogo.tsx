import React from "react";
import { motion } from "motion/react";

interface CryovaSkeletonLogoProps {
  className?: string;
  size?: number;
}

export function CryovaSkeletonLogo({ className = "text-[#BEF264]/15", size = 120 }: CryovaSkeletonLogoProps) {
  return (
    <div 
      className={`relative pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        {/* Drafting Grid Crosshairs */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-40" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-40" />
        
        {/* Blueprint Concentric Circles */}
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-30" />
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-30" />
        <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="0.5" className="opacity-25" />

        {/* Slow rotating outermost blueprint ring */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="42" 
          stroke="currentColor" 
          strokeWidth="0.75" 
          strokeDasharray="8 6" 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
          className="origin-center opacity-70"
        />

        {/* Faster counter-rotating inner technical ring */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="24" 
          stroke="currentColor" 
          strokeWidth="0.75" 
          strokeDasharray="4 4" 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="origin-center opacity-60"
        />

        {/* Central 4-point Star Skeleton outline */}
        <motion.path 
          d="M50 12C50 35 35 50 12 50C35 50 50 65 50 88C50 65 65 50 88 50C65 50 50 35 50 12Z" 
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="3 2"
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="origin-center opacity-90"
        />

        {/* Outer star envelope frame for blueprint precision feel */}
        <polygon 
          points="50,12 88,50 50,88 12,50" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          strokeDasharray="2 4"
          className="opacity-40" 
        />
      </svg>
    </div>
  );
}
