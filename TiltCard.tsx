import React, { useState, useRef, MouseEvent } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(190, 242, 100, 0.15)"
}

export function TiltCard({ children, className, glowColor = "rgba(168, 85, 247, 0.15)" }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates relative to card bounds
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth springs for tilt rotation
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { stiffness: 120, damping: 20 });

  // Spring for hover glow coordinates
  const glowX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const glowY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  
  // Declaring useTransforms unconditionally at the top level to prevent Hook order violation
  const glowLeft = useTransform(glowX, (val) => val - 175);
  const glowTop = useTransform(glowY, (val) => val - 175);
  
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    
    // Normalized coordinates (0 to 1)
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;

    x.set(normX);
    y.set(normY);

    // Glow coordinates in pixels
    const pX = e.clientX - rect.left;
    const pY = e.clientY - rect.top;
    glowX.set(pX);
    glowY.set(pY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden group transition-all duration-300 ${className}`}
    >
      {/* Dynamic Hover Radial Glow Effect */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none rounded-full blur-2xl z-0 transition-opacity duration-300"
          style={{
            width: "350px",
            height: "350px",
            background: `radial-gradient(circle, ${glowColor} 0%, rgba(255,255,255,0) 70%)`,
            left: glowLeft,
            top: glowTop,
          }}
        />
      )}
      
      {/* Inner Content wrapper to isolate 3D depth */}
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
