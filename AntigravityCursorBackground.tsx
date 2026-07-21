import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  pulseSpeed: number;
  pulseTimer: number;
  type: "circle" | "ring" | "sparkle";
}

export function AntigravityCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse movement event at document level
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Spawn a dynamic trail of particles
      if (Math.random() < 0.35) {
        const colors = ["#BEF264", "#A855F7", "#3B82F6", "#F43F5E"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        const types: Array<"circle" | "ring" | "sparkle"> = ["circle", "ring", "sparkle"];
        const randType = types[Math.floor(Math.random() * types.length)];
        
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          targetX: e.clientX,
          targetY: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 1.5 - 0.5, // gentle float upward
          size: Math.random() * 14 + 4,
          color: randColor,
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 80 + 40,
          pulseSpeed: 0.05 + Math.random() * 0.05,
          pulseTimer: Math.random() * Math.PI,
          type: randType,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Spawn automatic gentle ambient bubbles if mouse is inactive
    const ambientInterval = setInterval(() => {
      if (particlesRef.current.length < 40) {
        const colors = ["#BEF264", "#A855F7", "#3B82F6"];
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        particlesRef.current.push({
          x: Math.random() * width,
          y: height + 20, // Spawn from bottom
          targetX: 0,
          targetY: 0,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.2 - 0.4, // gently float upward
          size: Math.random() * 18 + 6,
          color: randColor,
          alpha: 0.6,
          life: 0,
          maxLife: Math.random() * 250 + 150,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseTimer: Math.random() * Math.PI,
          type: Math.random() > 0.4 ? "circle" : "ring",
        });
      }
    }, 400);

    const drawSparkle = (x: number, y: number, radius: number, color: string, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const nextAngle = ((i + 1) * Math.PI) / 2;
        const cx1 = x + Math.cos(angle) * radius;
        const cy1 = y + Math.sin(angle) * radius;
        const cx2 = x + Math.cos(nextAngle) * radius;
        const cy2 = y + Math.sin(nextAngle) * radius;
        
        ctx.quadraticCurveTo(x, y, cx1, cy1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Upward floating gravity logic
        p.vy -= 0.005; // tiny acceleration upward
        p.x += p.vx;
        p.y += p.vy;
        
        // Dynamic friction / drag
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Subtle attraction to mouse if within 180px
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 1) {
            // Gentle gravitational pull
            const pull = (1 - dist / 180) * 0.08;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        p.pulseTimer += p.pulseSpeed;
        const scale = 1 + Math.sin(p.pulseTimer) * 0.12;
        const currentSize = p.size * scale;
        
        // Calculate smooth fade out
        const remainingLife = p.maxLife - p.life;
        const fadeRatio = remainingLife / p.maxLife;
        const currentAlpha = p.alpha * Math.max(0, fadeRatio);

        if (p.life >= p.maxLife || p.y < -30 || p.x < -30 || p.x > width + 30) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        
        if (p.type === "circle") {
          ctx.fillStyle = p.color;
          // Glassy styling with radial gradient
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "ring") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.stroke();
          
          // Tiny core dot
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "sparkle") {
          drawSparkle(p.x, p.y, currentSize * 0.8, p.color, currentAlpha);
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(ambientInterval);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10 block"
      style={{ mixBlendMode: "screen", opacity: 0.45 }}
    />
  );
}
