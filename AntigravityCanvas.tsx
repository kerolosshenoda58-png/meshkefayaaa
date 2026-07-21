import React, { useEffect, useRef, useState } from "react";
import { Play, Flame, Sparkles, TrendingUp, Zap, Target } from "lucide-react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  avatarUrl: string;
  label: string;
  category: string;
  color: string;
  pulseSpeed: number;
  pulseTimer: number;
  isDragging: boolean;
}

interface AntigravityCanvasProps {
  gravityValue?: number; // -1 to 1
  bouncinessValue?: number; // 0 to 1
  mouseForceValue?: number; // 0 to 2
  mouseModeValue?: "repel" | "attract";
  className?: string;
}

const CREATORS_DATA = [
  {
    label: "★ CRYOVA",
    category: "Beauty",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
    color: "#BEF264", // Lime green
  },
  {
    label: "VIRAL REELS",
    category: "Gaming",
    avatarUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=250&auto=format&fit=crop",
    color: "#A855F7", // Purple
  },
  {
    label: "UGC MAGIC",
    category: "Tech",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
    color: "#3B82F6", // Blue
  },
  {
    label: "CONVERSION",
    category: "Fashion",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=250&auto=format&fit=crop",
    color: "#F43F5E", // Rose
  },
  {
    label: "BRAND FIT",
    category: "Lifestyle",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop",
    color: "#10B981", // Emerald
  },
  {
    label: "UNBOXING",
    category: "Fitness",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250&auto=format&fit=crop",
    color: "#F59E0B", // Amber
  },
  {
    label: "CREATOR OKR",
    category: "Music",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
    color: "#EC4899", // Pink
  },
  {
    label: "MATCHING AI",
    category: "Food",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=250&auto=format&fit=crop",
    color: "#06B6D4", // Cyan
  }
];

export function AntigravityCanvas({
  gravityValue = -0.15,
  bouncinessValue = 0.8,
  mouseForceValue = 1.0,
  mouseModeValue = "repel",
  className
}: AntigravityCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, isDown: false, activeId: -1, isInside: false });
  const imagesCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Handle image loading to avoid blinking during drawing
  useEffect(() => {
    CREATORS_DATA.forEach(c => {
      if (!imagesCacheRef.current.has(c.avatarUrl)) {
        const img = new Image();
        img.src = c.avatarUrl;
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
        img.onload = () => {
          imagesCacheRef.current.set(c.avatarUrl, img);
        };
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Re-position bubbles if they are off screen after resizing
      bubblesRef.current.forEach(b => {
        if (b.x > width - b.radius) b.x = width - b.radius;
        if (b.y > height - b.radius) b.y = height - b.radius;
      });
    };

    // Initialize bubbles
    const initBubbles = () => {
      const bubbles: Bubble[] = [];
      const count = CREATORS_DATA.length;
      
      const container = containerRef.current;
      const w = container ? container.clientWidth : 800;
      const h = container ? container.clientHeight : 600;

      for (let i = 0; i < count; i++) {
        const data = CREATORS_DATA[i];
        // Calculate nice desktop and mobile responsive radius
        const isMobile = w < 768;
        const radius = isMobile ? Math.random() * 12 + 35 : Math.random() * 15 + 50; // Radius range: 35-47 (mobile) or 50-65 (desktop)
        
        // Distribute nicely
        const x = Math.random() * (w - radius * 2) + radius;
        const y = Math.random() * (h - radius * 2) + radius;

        bubbles.push({
          id: i,
          x,
          y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius,
          mass: radius * radius,
          avatarUrl: data.avatarUrl,
          label: data.label,
          category: data.category,
          color: data.color,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseTimer: Math.random() * Math.PI,
          isDragging: false
        });
      }
      bubblesRef.current = bubbles;
    };

    resize();
    initBubbles();

    // Use ResizeObserver for responsive width and height
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        resize();
      });
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const physicsLoop = () => {
      // 1. CLEAR CANVAS
      ctx.clearRect(0, 0, width, height);

      // Subtle background grid of dots (Antigravity vibe)
      ctx.strokeStyle = "rgba(168, 85, 247, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.fillStyle = "rgba(20, 20, 20, 0.05)";
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      const bubbles = bubblesRef.current;
      const mouse = mouseRef.current;

      // 2. PHYSICS CALCULATIONS
      // Friction coefficient
      const friction = 0.985;

      bubbles.forEach((b) => {
        b.pulseTimer += b.pulseSpeed;

        if (b.isDragging) {
          // Track mouse smoothly with spring physics
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          b.vx = dx * 0.2;
          b.vy = dy * 0.2;
        } else {
          // Apply gravity (float-up is negative, push-down is positive)
          // Scale it with mass to give a cool organic feeling (larger bubbles float faster or slower depending on user intent)
          b.vy += gravityValue * 0.05;

          // Mouse attraction / repulsion forces
          if (mouse.isInside) {
            const dx = mouse.x - b.x;
            const dy = mouse.y - b.y;
            const dist = Math.hypot(dx, dy);
            const influenceRadius = 250;

            if (dist < influenceRadius && dist > 1) {
              const force = (1 - dist / influenceRadius) * 0.12 * mouseForceValue;
              if (mouseModeValue === "repel") {
                // Push away
                b.vx -= (dx / dist) * force * 5;
                b.vy -= (dy / dist) * force * 5;
              } else {
                // Pull in
                b.vx += (dx / dist) * force * 4;
                b.vy += (dy / dist) * force * 4;
              }
            }
          }

          // Gentle center pull so they don't lock at boundaries
          const centerPull = 0.0003;
          b.vx += (width / 2 - b.x) * centerPull;
          b.vy += (height / 2 - b.y) * centerPull;

          // Apply velocity friction
          b.vx *= friction;
          b.vy *= friction;
        }

        // Apply position update
        b.x += b.vx;
        b.y += b.vy;

        // Boundary collision checking
        if (b.x < b.radius) {
          b.x = b.radius;
          b.vx = -b.vx * bouncinessValue;
        } else if (b.x > width - b.radius) {
          b.x = width - b.radius;
          b.vx = -b.vx * bouncinessValue;
        }

        if (b.y < b.radius) {
          b.y = b.radius;
          b.vy = -b.vy * bouncinessValue;
        } else if (b.y > height - b.radius) {
          b.y = height - b.radius;
          b.vy = -b.vy * bouncinessValue;
        }
      });

      // 3. CIRCLE-TO-CIRCLE ELASTIC COLLISIONS
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distance = Math.hypot(dx, dy);
          const minDistance = b1.radius + b2.radius;

          if (distance < minDistance) {
            // Overlapping resolved
            const overlap = minDistance - distance;
            const nx = dx / distance;
            const ny = dy / distance;

            // Push apart equally (or weighted by mass)
            const b1Percent = b2.mass / (b1.mass + b2.mass);
            const b2Percent = b1.mass / (b1.mass + b2.mass);

            if (!b1.isDragging) {
              b1.x -= nx * overlap * b1Percent;
              b1.y -= ny * overlap * b1Percent;
            }
            if (!b2.isDragging) {
              b2.x += nx * overlap * b2Percent;
              b2.y += ny * overlap * b2Percent;
            }

            // 1D elastic collision on normal axis
            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

            if (!b1.isDragging) {
              b1.vx -= p * b2.mass * nx * bouncinessValue;
              b1.vy -= p * b2.mass * ny * bouncinessValue;
            }
            if (!b2.isDragging) {
              b2.vx += p * b1.mass * nx * bouncinessValue;
              b2.vy += p * b1.mass * ny * bouncinessValue;
            }
          }
        }
      }

      // 4. DRAW BUBBLES
      bubbles.forEach((b) => {
        // Pulse glow scaling
        const pulse = Math.sin(b.pulseTimer) * 2.5;
        const currentRadius = b.radius + pulse;

        ctx.save();

        // Drop shadow for modern card styling
        ctx.shadowColor = "rgba(20, 20, 20, 0.08)";
        ctx.shadowBlur = b.isDragging ? 24 : 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = b.isDragging ? 12 : 6;

        // Background neon-tinted border circle
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.isDragging ? 3 : 1.5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Clear drop shadow for inner drawing
        ctx.shadowColor = "transparent";

        // Draw Avatar Clipped in Circle
        const img = imagesCacheRef.current.get(b.avatarUrl);
        if (img) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius - 3, 0, Math.PI * 2);
          ctx.clip();
          
          // Center fit image
          ctx.drawImage(
            img, 
            b.x - currentRadius, 
            b.y - currentRadius, 
            currentRadius * 2, 
            currentRadius * 2
          );
          ctx.restore();
        } else {
          // Safe fallback colorful design with initials
          ctx.fillStyle = b.color + "20"; // 12% opacity
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius - 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Overlapping elegant UI Glass Badge: "★ CRYOVA", etc.
        // We'll place it slightly off center, overlapping the bottom of the circle
        const badgeWidth = currentRadius * 1.5;
        const badgeHeight = Math.max(16, currentRadius * 0.32);
        const badgeX = b.x - badgeWidth / 2;
        const badgeY = b.y + currentRadius * 0.45;

        // Draw pill background
        ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
        ctx.strokeStyle = b.color + "50";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const r = badgeHeight / 2;
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, r);
        ctx.fill();
        ctx.stroke();

        // Draw Badge Category/Name Text
        ctx.fillStyle = b.color;
        ctx.font = `bold ${Math.max(8, currentRadius * 0.16)}px "JetBrains Mono", Courier, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.label, b.x, badgeY + badgeHeight / 2);

        // Category Tag in top-left
        const tagX = b.x - currentRadius * 0.5;
        const tagY = b.y - currentRadius * 0.9;
        const tagWidth = currentRadius * 1.0;
        const tagHeight = Math.max(14, currentRadius * 0.28);

        ctx.fillStyle = b.color;
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#141414";
        ctx.font = `black uppercase ${Math.max(7, currentRadius * 0.14)}px "Inter", sans-serif`;
        ctx.fillText(b.category, tagX + tagWidth / 2, tagY + tagHeight / 2);

        // Play/Status overlay (e.g., small camera/play icon at the center if hovered/dragging)
        if (b.isDragging) {
          ctx.fillStyle = "rgba(190, 242, 100, 0.95)";
          ctx.beginPath();
          ctx.arc(b.x, b.y, 16, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#141414";
          ctx.beginPath();
          ctx.moveTo(b.x - 3, b.y - 5);
          ctx.lineTo(b.x + 6, b.y);
          ctx.lineTo(b.x - 3, b.y + 5);
          ctx.fill();
        }

        ctx.restore();
      });

      // 5. RENDER ACTIVE CONNECTIVE THREADS (Interactivity)
      // Draw dynamic lines connecting bubbles to the mouse if they are close
      if (mouse.isInside && mouse.activeId === -1) {
        bubbles.forEach((b) => {
          const dx = mouse.x - b.x;
          const dy = mouse.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            ctx.save();
            ctx.strokeStyle = `${b.color}${Math.floor((1 - dist / 180) * 120).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = (1 - dist / 180) * 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      animationId = requestAnimationFrame(physicsLoop);
    };

    physicsLoop();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [gravityValue, bouncinessValue, mouseForceValue, mouseModeValue]);

  // Canvas Mouse / Touch events handlers
  const getMouseCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    const mouse = mouseRef.current;
    mouse.x = coords.x;
    mouse.y = coords.y;
    mouse.isDown = true;

    // Check if clicked inside any bubble
    const bubbles = bubblesRef.current;
    let clickedId = -1;
    let maxZDist = 999999;

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const dist = Math.hypot(coords.x - b.x, coords.y - b.y);
      if (dist < b.radius) {
        clickedId = b.id;
        break;
      }
    }

    if (clickedId !== -1) {
      mouse.activeId = clickedId;
      const b = bubbles.find(x => x.id === clickedId);
      if (b) {
        b.isDragging = true;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    const mouse = mouseRef.current;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = coords.x;
    mouse.y = coords.y;
    mouse.isInside = true;

    if (mouse.isDown && mouse.activeId !== -1) {
      const b = bubblesRef.current.find(x => x.id === mouse.activeId);
      if (b) {
        b.x = coords.x;
        b.y = coords.y;
      }
    }
  };

  const handleMouseUp = () => {
    const mouse = mouseRef.current;
    mouse.isDown = false;
    
    if (mouse.activeId !== -1) {
      const b = bubblesRef.current.find(x => x.id === mouse.activeId);
      if (b) {
        b.isDragging = false;
        // Fling it!
        b.vx = (mouse.x - mouse.px) * 0.45;
        b.vy = (mouse.y - mouse.py) * 0.45;
      }
      mouse.activeId = -1;
    }
  };

  const handleMouseLeave = () => {
    const mouse = mouseRef.current;
    mouse.isInside = false;
    handleMouseUp();
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl ${className}`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="block touch-none"
      />
      {/* Absolute overlay instructions */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <Sparkles className="w-3.5 h-3.5 text-[#BEF264] animate-spin-slow" />
        <span className="text-[10px] font-mono tracking-wide text-white uppercase">Grab & fling creators</span>
      </div>
    </div>
  );
}
