import React, { useEffect, useRef } from "react";

export function BackgroundEffects({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      // Keep CSS vars stable (no parallax loop) for reduced-motion users.
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", "0");
        containerRef.current.style.setProperty("--mouse-y", "0");
      }
      return;
    }

    let reqId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate coordinates relative to center of screen (multiplied by factor for depth)
      targetX = (e.clientX - window.innerWidth / 2) * 0.08;
      targetY = (e.clientY - window.innerHeight / 2) * 0.08;
    };

    const updateParallax = () => {
      // Buttery smooth linear interpolation (lerp) for high-end feel
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${currentX}`);
        containerRef.current.style.setProperty("--mouse-y", `${currentY}`);
      }
      reqId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    reqId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-[-1] select-none bg-neutral-950"
      style={{
        // Initialize CSS variables to prevent layout shift or empty values
        ["--mouse-x" as any]: "0",
        ["--mouse-y" as any]: "0",
      }}
    >
      {/* Inline styles for high-performance GPU animations */}
      <style>{`
        .gpu-orb {
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .gpu-orb-1 {
          --parallax-x1: calc(var(--mouse-x) * -1.5px);
          --parallax-y1: calc(var(--mouse-y) * -1.5px);
          animation: orb-pulse-1 15s ease-in-out infinite;
        }

        .gpu-orb-2 {
          --parallax-x2: calc(var(--mouse-x) * -0.8px);
          --parallax-y2: calc(var(--mouse-y) * -0.8px);
          animation: orb-pulse-2 20s ease-in-out infinite;
        }

        .gpu-orb-3 {
          animation: orb-drift-3 25s ease-in-out infinite;
        }

        .gpu-shimmer-grid {
          will-change: background-position;
          
          /* The grid mask pattern: defines the stenciled lines */
          -webkit-mask-image: 
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px);
          -webkit-mask-size: 50px 50px;
          mask-image: 
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px);
          mask-size: 50px 50px;

          /* Layer 1: Sweeping glow gradient; Layer 2: Base grid line color */
          background-image: 
            linear-gradient(to bottom, transparent, rgba(190, 240, 48, 0.35) 50%, transparent),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0.015));
          background-size: 100% 300px, 100% 100%;
          background-repeat: no-repeat, no-repeat;
          background-position: 0 -300px, 0 0;
          
          filter: drop-shadow(0 0 6px rgba(190, 240, 48, 0.359));
          animation: grid-scan-sweep 12s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes grid-scan-sweep {
          0% {
            background-position: 0 -300px, 0 0;
          }
          100% {
            background-position: 0 calc(100% + 300px), 0 0;
          }
        }

        @keyframes orb-pulse-1 {
          0%, 100% {
            transform: translate3d(var(--parallax-x1), var(--parallax-y1), 0) scale(1);
            opacity: 0.35;
          }
          33% {
            transform: translate3d(var(--parallax-x1), var(--parallax-y1), 0) scale(1.15);
            opacity: 0.5;
          }
          66% {
            transform: translate3d(var(--parallax-x1), var(--parallax-y1), 0) scale(0.95);
            opacity: 0.45;
          }
        }

        @keyframes orb-pulse-2 {
          0%, 100% {
            transform: translate3d(var(--parallax-x2), var(--parallax-y2), 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(var(--parallax-x2), var(--parallax-y2), 0) scale(0.9);
            opacity: 0.45;
          }
        }

        @keyframes orb-drift-3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(50px, -40px, 0) scale(1.2);
          }
          66% {
            transform: translate3d(-30px, 40px, 0) scale(0.8);
          }
        }

        @keyframes particle-float-even {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
          50% { transform: translate3d(15px, -30px, 0); opacity: 0.8; }
        }

        @keyframes particle-float-odd {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
          50% { transform: translate3d(-15px, -30px, 0); opacity: 0.8; }
        }
      `}</style>

      {/* ── Technical Grid Overlay with Single-Element Shimmer Sweep ── */}
      <div className="absolute inset-0 pointer-events-none opacity-80 gpu-shimmer-grid" />

      {/* ── Glassmorphism Matte Grain Overlay ── */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-2" />

      {/* ── Slow Shifting Neon Mesh Gradients (Parallax Reactive) ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb 1: Brand Neon Lime (Top-Left quadrant, slow pulse + mouse chase) */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px] gpu-orb gpu-orb-1"
          style={{
            background:
              "radial-gradient(circle, rgba(210, 250, 100, 0.12) 0%, rgba(168, 217, 24, 0.05) 40%, transparent 80%)",
            top: "10%",
            left: "5%",
          }}
        />

        {/* Orb 2: Deep Teal / Blue (Bottom-Right quadrant, slow drift + mouse chase) */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[160px] gpu-orb gpu-orb-2"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.03) 50%, transparent 90%)",
            bottom: "10%",
            right: "5%",
          }}
        />

        {/* Orb 3: Mid-center warm accent (floating slowly to create dynamic lighting) */}
        <div
          className="absolute w-[450px] h-[450px] rounded-full blur-[150px] gpu-orb gpu-orb-3"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 217, 24, 0.03) 0%, transparent 70%)",
            top: "40%",
            left: "40%",
          }}
        />
      </div>

      {/* ── Floating Particle Field ── */}
      <div className="absolute inset-0 opacity-15">
        {[...Array(6)].map((_, i) => {
          const size = i * 2 + 4;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-brand-300/20"
              style={{
                width: size,
                height: size,
                top: `${20 + i * 12}%`,
                left: `${15 + i * 14}%`,
                filter: "blur(1px)",
                boxShadow: "0 0 4px rgba(210, 250, 100, 0.25)",
                animation: `particle-float-${i % 2 === 0 ? "even" : "odd"} ${10 + i * 3}s ease-in-out infinite`,
                willChange: "transform",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default BackgroundEffects;
