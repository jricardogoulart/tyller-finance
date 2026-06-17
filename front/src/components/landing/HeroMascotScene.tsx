import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { transition } from "./motion";

const MASCOT_SRC = "/Tyller%20Hero.png";

type CoinConfig = {
  id: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  depth: number;
  delay: number;
  duration: number;
  symbol: string;
};

// Kept only 4 coins to remove excess visual noise (Item 81)
const COINS: CoinConfig[] = [
  { id: "c1", top: "8%", left: "4%", size: 42, depth: 0.68, delay: 0, duration: 5.2, symbol: "R$" }, // blurry background
  { id: "c2", top: "14%", right: "-2%", size: 52, depth: 0.88, delay: 0.4, duration: 4.8, symbol: "◆" }, // crisp mid-foreground
  { id: "c4", top: "45%", right: "-6%", size: 48, depth: 0.95, delay: 0.2, duration: 4.4, symbol: "◆" }, // crisp foreground
  { id: "c5", bottom: "18%", left: "6%", size: 40, depth: 0.75, delay: 1.1, duration: 5, symbol: "R$" }, // soft mid-ground
];

function Coin3D({
  size,
  depth,
  symbol,
  delay,
  duration,
  reducedMotion,
}: Pick<CoinConfig, "size" | "depth" | "symbol" | "delay" | "duration"> & {
  reducedMotion: boolean | null;
}) {
  const uid = `coin-${symbol}-${size}-${delay}`.replace(/\W/g, "");
  
  // Real Bokeh blur logic based on depth (Item 52)
  const blurVal = depth < 0.75 ? "2px" : depth < 0.88 ? "0.8px" : "0px";

  return (
    <motion.div
      className="pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        filter: `drop-shadow(0 ${6 * depth}px ${14 * depth}px rgba(0,0,0,0.45)) blur(${blurVal})`,
      }}
      animate={
        reducedMotion
          ? { rotateY: 18, scale: depth }
          : {
              y: [0, -10 * depth, 0],
              rotateY: [0, 180, 360],
              scale: [depth * 0.96, depth * 1.04, depth * 0.96],
            }
      }
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { duration, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        aria-hidden
        style={{ transform: "rotateX(12deg)" }}
      >
        <defs>
          <linearGradient id={`${uid}-face`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fde8" />
            <stop offset="35%" stopColor="#dff986" />
            <stop offset="65%" stopColor="#bef030" />
            <stop offset="100%" stopColor="#86ae10" />
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#475d08" />
            <stop offset="50%" stopColor="#a8d918" />
            <stop offset="100%" stopColor="#2e3d05" />
          </linearGradient>
          <radialGradient id={`${uid}-shine`} cx="30%" cy="25%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="58" rx="22" ry="5" fill="rgba(0,0,0,0.35)" />
        <circle cx="32" cy="32" r="28" fill={`url(#${uid}-rim)`} />
        <circle cx="32" cy="30" r="24" fill={`url(#${uid}-face)`} />
        <circle cx="32" cy="30" r="24" fill={`url(#${uid}-shine)`} />
        <circle cx="32" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fontSize={symbol === "R$" ? "14" : "18"}
          fontFamily="var(--font-family-mono)"
          fontWeight="700"
          fill="#2e3d05"
        >
          {symbol}
        </text>
      </svg>
    </motion.div>
  );
}

export function HeroMascotScene() {
  const reducedMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse move Parallax effect (Item 86)
  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 35;
      const y = (clientY - window.innerHeight / 2) / 35;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  return (
    <div
      className="relative mx-auto lg:mx-0 w-full max-w-[min(100%,380px)] aspect-square"
      style={{ perspective: "1100px" }}
      aria-hidden
    >
      {/* Ambient stage */}
      <motion.div
        className="absolute inset-[12%] rounded-full blur-[80px] opacity-40 pointer-events-none bg-glow-lime"
        style={{
          mixBlendMode: "screen",
          x: mousePos.x * -0.5,
          y: mousePos.y * -0.5
        }}
      />
      
      {/* Soft Contact Shadow under floating mascot (Item 49) */}
      <motion.div
        className="absolute left-[26%] bottom-[12%] w-[48%] h-[8px] bg-black/60 rounded-full blur-[5px] z-0 pointer-events-none"
        style={{
          transform: "rotateX(75deg)",
          x: mousePos.x * 0.4,
          y: mousePos.y * 0.4
        }}
        animate={reducedMotion ? undefined : {
          scale: [0.95, 1.05, 0.95],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={reducedMotion ? undefined : {
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div
        className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[72%] h-[14%] rounded-[100%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(190,240,48,0.18) 0%, transparent 70%)",
          transform: "rotateX(72deg)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[58%] h-[3px] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(190,240,48,0.5), transparent)",
          boxShadow: "0 0 24px rgba(190,240,48,0.35)",
        }}
      />

      {/* Orbiting coins with mouse parallax offset */}
      <motion.div
        style={{
          x: mousePos.x * 1.3,
          y: mousePos.y * 1.3
        }}
        className="absolute inset-0 pointer-events-none z-20"
      >
        {COINS.map((coin) => (
          <div
            key={coin.id}
            className="absolute"
            style={{
              top: coin.top,
              left: coin.left,
              right: coin.right,
              bottom: coin.bottom,
            }}
          >
            <Coin3D
              size={coin.size}
              depth={coin.depth}
              symbol={coin.symbol}
              delay={coin.delay}
              duration={coin.duration}
              reducedMotion={reducedMotion}
            />
          </div>
        ))}
      </motion.div>

      {/* Mascot — smaller, centered, floating + mouse parallax */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          x: mousePos.x * 0.8,
          y: mousePos.y * 0.8
        }}
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition(0.85, 0.4, reducedMotion)}
      >
        <motion.img
          src={MASCOT_SRC}
          alt=""
          className="w-[58%] max-w-[200px] h-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
          width={200}
          height={260}
          fetchPriority="high"
          decoding="async"
          animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          }
          style={{
            filter: "drop-shadow(0 0 32px rgba(190,240,48,0.15))",
          }}
        />
      </motion.div>

      {/* Subtle tech grid behind */}
      <motion.div 
        style={{
          x: mousePos.x * -0.2,
          y: mousePos.y * -0.2
        }}
        className="absolute inset-[8%] rounded-full bg-tech-grid opacity-30 pointer-events-none z-0" 
      />
    </div>
  );
}
