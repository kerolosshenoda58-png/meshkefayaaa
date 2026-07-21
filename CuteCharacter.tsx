import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface CuteCharacterProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  isWalking?: boolean;
}

export function CuteCharacter({ className, size = "md", isWalking = true }: CuteCharacterProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse follow
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Movement transforms
  const eyeX = useTransform(springX, [-1, 1], [-4, 4]);
  const eyeY = useTransform(springY, [-1, 1], [-4, 4]);
  const headRotate = useTransform(springX, [-1, 1], [-10, 10]);
  const bodyX = useTransform(springX, [-1, 1], [-5, 5]);

  const sizes = {
    sm: { container: "w-8 h-8", head: "w-6 h-6", eyeGap: "gap-1", eye: "w-1 h-1.5", cheek: "w-1.5 h-0.5 top-3.5 left-1", legX: 2, legY: 3, leg: "w-1.5 h-3" },
    md: { container: "w-16 h-16", head: "w-10 h-10", eyeGap: "gap-2", eye: "w-1.5 h-2", cheek: "w-2 h-1 top-6 left-4", legX: 4, legY: 6, leg: "w-3 h-6" },
    lg: { container: "w-32 h-32", head: "w-20 h-20", eyeGap: "gap-4", eye: "w-3 h-4", cheek: "w-4 h-2 top-12 left-8", legX: 8, legY: 12, leg: "w-6 h-12" },
  };

  const s = sizes[size];

  return (
    <div className={cn(`relative flex items-end justify-center`, s.container, className)}>
      {/* Body/Head */}
      <motion.div
        className={cn(`absolute bg-[#141414] rounded-full z-10 overflow-hidden`, s.head, size === 'sm' ? 'bottom-1' : size === 'md' ? 'bottom-4' : 'bottom-8')}
        style={{ x: bodyX, rotate: headRotate }}
        animate={isWalking ? {
          y: size === 'sm' ? [0, -4, 0] : size === 'md' ? [0, -12, 0] : [0, -24, 0],
          scaleY: [1, 0.9, 1],
          scaleX: [1, 1.05, 1],
        } : undefined}
        transition={isWalking ? {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      >
        {/* Eyes Group - moves with mouse */}
        <motion.div 
          className={cn(`flex absolute`, s.eyeGap, size === 'sm' ? 'top-1.5 left-1' : size === 'md' ? 'top-3 left-2.5' : 'top-6 left-5')}
          style={{ x: eyeX, y: eyeY }}
        >
          <div className={cn(`bg-white rounded-full`, s.eye)}></div>
          <div className={cn(`bg-white rounded-full`, s.eye)}></div>
        </motion.div>
        
        {/* Blush */}
        <motion.div 
           className={cn(`absolute bg-pink-400 rounded-full opacity-50`, s.cheek)}
           style={{ x: eyeX, y: eyeY }}
        ></motion.div>
      </motion.div>
      
      {/* Legs */}
      <div className={cn(`flex absolute bottom-0 z-0`, size === 'sm' ? 'gap-1' : size === 'md' ? 'gap-4' : 'gap-8')}>
        <motion.div
          className={cn(`bg-[#A855F7] rounded-full origin-top`, s.leg)}
          animate={isWalking ? {
            rotate: [20, -30, 20],
            y: [0, -s.legY, 0]
          } : {
            rotate: 10
          }}
          transition={isWalking ? {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
        <motion.div
          className={cn(`bg-[#BEF264] rounded-full origin-top`, s.leg)}
          animate={isWalking ? {
            rotate: [-30, 20, -30],
            y: [-s.legY, 0, -s.legY]
          } : {
             rotate: -10
          }}
          transition={isWalking ? {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
      </div>
      
      {/* Shadow */}
      {isWalking && (
        <motion.div
          className={cn(`absolute -bottom-2 bg-black/10 rounded-full blur-sm`, size === 'sm' ? 'w-6 h-1' : size === 'md' ? 'w-12 h-2' : 'w-24 h-4')}
          animate={{
            scale: [1, 0.6, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}
