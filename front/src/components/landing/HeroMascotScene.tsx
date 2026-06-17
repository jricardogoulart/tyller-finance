import { motion, useReducedMotion } from "framer-motion";
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

const COINS: CoinConfig[] = [
  { id: "c1", top: "6%", left: "2%", size: 44, depth: 0.72, delay: 0, duration: 5.2, symbol: "R$" },
  { id: "c2", top: "14%", right: "-2%", size: 52, depth: 0.88, delay: 0.4, duration: 4.8, symbol: "◆" },
  { id: "c3", top: "42%", left: "-10%", size: 38, depth: 0.62, delay: 0.8, duration: 5.6, symbol: "R$" },
  { id: "c4", top: "38%", right: "-8%", size: 48, depth: 0.95, delay: 0.2, duration: 4.4, symbol: "◆" },
  { id: "c5", bottom: "20%", left: "4%", size: 42, depth: 0.78, delay: 1.1, duration: 5, symbol: "R$" },
  { id: "c6", bottom: "16%", right: "2%", size: 46, depth: 0.84, delay: 0.6, duration: 4.6, symbol: "◆" },
  { id: "c7", top: "22%", left: "50%", size: 32, depth: 0.55, delay: 1.4, duration: 6, symbol: "R$" },
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

  return (
    <motion.div
      className="pointer-events-none select-none"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        filter: `drop-shadow(0 ${6 * depth}px ${14 * depth}px rgba(0,0,0,0.45))`,
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

  return (
    <div
      className="relative mx-auto lg:mx-0 w-full max-w-[min(100%,380px)] aspect-square"
      style={{ perspective: "1100px" }}
      aria-hidden
    >
      {/* Ambient stage */}
      <div
        className="absolute inset-[12%] rounded-full blur-[80px] opacity-40 pointer-events-none bg-glow-lime"
        style={{ mixBlendMode: "screen" }}
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

      {/* Orbiting coins */}
      {COINS.map((coin) => (
        <div
          key={coin.id}
          className="absolute z-20"
          style={{
            top: coin.top,
            left: coin.left,
            right: coin.right,
            bottom: coin.bottom,
            transform: coin.id === "c7" ? "translateX(-50%)" : undefined,
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

      {/* Mascot — smaller, centered, floating */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition(0.85, 0.4, reducedMotion)}
      >
        <motion.img
          src={MASCOT_SRC}
          alt=""
          className="w-[58%] max-w-[220px] h-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
          width={220}
          height={280}
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
      <div className="absolute inset-[8%] rounded-full bg-tech-grid opacity-30 pointer-events-none z-0" />
    </div>
  );
}
