import React from "react";
import { motion } from "motion/react";

interface CryovaLogoSymbolProps {
  className?: string;
  showSkeleton?: boolean;
}

export function CryovaLogoSymbol({ className = "w-6 h-6 text-[#BEF264]", showSkeleton = true }: CryovaLogoSymbolProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {showSkeleton && (
        <>
          {/* Blueprint Drafting Crosshairs */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" className="opacity-25" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" className="opacity-25" />
          
          {/* Concentric helper blueprint circles */}
          <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 4" className="opacity-15" />
          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-20" />
          <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="0.5" className="opacity-15" />
          
          {/* Subtle slow rotating skeleton elements */}
          <motion.circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            strokeDasharray="4 8" 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
            className="origin-center opacity-30"
          />
          <motion.circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="1 8" 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            className="origin-center opacity-25"
          />
        </>
      )}

      {/* Outer spinning dash ring using framer-motion */}
      <motion.circle 
        cx="50" 
        cy="50" 
        r="42" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeDasharray="14 10" 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="origin-center"
      />
      {/* Central 4-point Star */}
      <path 
        d="M50 8C50 35 35 50 8 50C35 50 50 65 50 92C50 65 65 50 92 50C65 50 50 35 50 8Z" 
        fill="currentColor" 
      />
      {/* Dark core overlay */}
      <circle cx="50" cy="50" r="15" fill="#141414" />
      {/* Center dot */}
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}
