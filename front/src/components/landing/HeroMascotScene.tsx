import { motion, useReducedMotion } from "framer-motion";

// ── Static imports — processed by Vite, inlined as data URLs by viteSingleFile ──
import mascotSrc from "../../assets/images/tyller-hero.webp";
import coinGreen1Src from "../../assets/images/greencoinv1.webp";
import coin1Src from "../../assets/images/Coin1.webp";
import coinGreen2Src from "../../assets/images/greencoinv2.webp";
import tcoin1Src from "../../assets/images/tcoin1.webp";
import coin2Src from "../../assets/images/Coin2.webp";

// Standard, uniform coin size (px) — every coin renders at the same size.
const COIN_SIZE = 50;

type GlowTone = "gold" | "green";

type CoinConfig = {
  id: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  depth: number;
  src: string;
  glow: GlowTone;
};

const GLOW_RGB: Record<GlowTone, string> = {
  gold: "212,175,55",
  green: "190,240,48",
};

// Coins use brand image assets — imported statically so Vite bundles them.
// Harmonious, balanced set: 3 green brand coins + 3 gold, evenly spread around the mascot.
const COINS: CoinConfig[] = [
  { id: "c1", top: "8%", left: "4%", depth: 0.72, src: coinGreen1Src, glow: "green" },
  { id: "c2", top: "12%", right: "2%", depth: 0.88, src: coin1Src, glow: "gold" },
  { id: "c3", top: "40%", left: "-5%", depth: 0.82, src: coinGreen2Src, glow: "green" },
  { id: "c4", top: "44%", right: "-5%", depth: 0.92, src: tcoin1Src, glow: "gold" },
  { id: "c5", bottom: "20%", left: "6%", depth: 0.78, src: coin2Src, glow: "gold" },
  { id: "c6", bottom: "24%", right: "3%", depth: 0.84, src: coinGreen2Src, glow: "green" },
];

function Coin3D({
  depth,
  src,
  glow,
  reducedMotion,
}: Pick<CoinConfig, "depth" | "src" | "glow"> & {
  reducedMotion: boolean | null;
}) {
  const rgb = GLOW_RGB[glow];
  const spinDuration = 9 - depth * 2.5;
  const floatDuration = 5.5 + depth * 2;
  const floatOffset = 6 + depth * 4;

  return (
    <motion.div
      className="pointer-events-none select-none relative"
      style={{ width: COIN_SIZE, height: COIN_SIZE, transform: `scale(${depth})`, willChange: "transform" }}
      animate={reducedMotion ? undefined : { y: [-floatOffset, floatOffset, -floatOffset] }}
      transition={reducedMotion ? undefined : { duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Static soft contact shadow */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 60%, rgba(0,0,0,0.28) 0%, transparent 65%)`,
          filter: "blur(4px)",
          transform: "translateY(10%)",
        }}
      />
      {/* Pulsing ambient glow halo */}
      <motion.span
        aria-hidden
        className="absolute inset-[-22%] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${rgb},0.28) 0%, transparent 62%)`,
          willChange: "transform, opacity",
        }}
        animate={reducedMotion ? { opacity: 0.3 } : { opacity: [0.25, 0.55, 0.25], scale: [0.92, 1.06, 0.92] }}
        transition={
          reducedMotion
            ? { duration: 0.01 }
            : { duration: floatDuration * 0.8, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.img
        src={src}
        alt=""
        aria-hidden
        width={COIN_SIZE}
        height={COIN_SIZE}
        decoding="async"
        loading="lazy"
        className="relative w-full h-full object-contain"
        style={{ backfaceVisibility: "hidden", willChange: "transform" }}
        animate={reducedMotion ? { rotateY: 18 } : { rotateY: 360 }}
        transition={
          reducedMotion
            ? { duration: 0.01 }
            : { duration: spinDuration, repeat: Infinity, ease: "linear" }
        }
      />

      {/* Specular shader — glint sweeping across the coin face */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          mixBlendMode: "screen",
          willChange: "transform, opacity",
          background: `linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.95) 47%, rgba(${rgb},0.75) 53%, transparent 72%)`,
          backgroundSize: "260% 260%",
        }}
        animate={
          reducedMotion
            ? { backgroundPosition: "50% 50%", opacity: 0.4 }
            : { backgroundPosition: ["140% -40%", "-40% 140%"], opacity: [0, 1, 0] }
        }
        transition={
          reducedMotion
            ? { duration: 0.01 }
            : { duration: spinDuration * 0.66, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }
        }
      />

      {/* Thin bright metallic rim */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          mixBlendMode: "screen",
          background: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(${rgb},0.5) 78%, transparent 82%)`,
        }}
      />
    </motion.div>
  );
}

export function HeroMascotScene() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]"
      style={{ perspective: "1100px", height: "320px" }}
      aria-hidden
    >
      {/* Ambient stage glow */}
      <div
        className="absolute inset-[12%] rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(190,240,48,0.5) 0%, transparent 60%)" }}
      />

      {/* Cylinder pedestal */}
      <div className="absolute left-1/2 bottom-[-36%] -translate-x-1/2 w-[96%] h-[92%] z-0 pointer-events-none">
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[98%] h-[36px] rounded-[100%] bg-black/55 blur-[10px]" />
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[18px] w-full h-[calc(100%-36px)] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #8a9685 0%, #adb6a7 45%, #adb6a7 55%, #8a9685 100%)",
            borderLeft: "1px solid rgba(206,212,202,0.45)",
            borderRight: "1px solid rgba(206,212,202,0.45)",
            boxShadow: "inset 0 0 40px rgba(20,23,18,0.28), 0 0 40px rgba(190,240,48,0.1)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full h-[36px] rounded-[100%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 60%, #667a60 0%, #4e5e49 60%, transparent 100%)",
            borderTop: "1px solid rgba(206,212,202,0.4)",
            boxShadow: "0 6px 26px rgba(0,0,0,0.5)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-full h-[42px] rounded-[100%]"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #ced4ca 0%, #adb6a7 60%, #8a9685 100%)",
            border: "1px solid rgba(206,212,202,0.55)",
            boxShadow: "0 0 30px rgba(190,240,48,0.12), inset 0 6px 16px rgba(20,23,18,0.2), inset 0 -3px 8px rgba(206,212,202,0.5)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[4px] w-[80%] h-[26px] rounded-[100%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(237,240,236,0.6) 0%, transparent 65%)",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[10px] w-[66%] h-[3px] rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(190,240,48,0.8), transparent)",
            boxShadow: "0 0 20px rgba(190,240,48,0.5)",
          }}
        />
      </div>

      {/* Coins */}
      <div className="absolute inset-0 pointer-events-none z-20" style={{ transform: "translateY(-20%)" }}>
        {COINS.map((coin) => (
          <div
            key={coin.id}
            className="absolute"
            style={{ top: coin.top, left: coin.left, right: coin.right, bottom: coin.bottom }}
          >
            <Coin3D depth={coin.depth} src={coin.src} glow={coin.glow} reducedMotion={reducedMotion} />
          </div>
        ))}
      </div>

      {/* Mascot image — centered in the 380×380 container */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <img
          src={mascotSrc}
          alt=""
          className="w-[46%] sm:w-[55%] h-auto object-contain"
          width={200}
          height={250}
          fetchPriority="high"
          decoding="async"
          style={{
            transform: "translateY(-52%)",
            filter: "drop-shadow(0 0 44px rgba(190,240,48,0.35)) drop-shadow(0 18px 42px rgba(0,0,0,0.7))",
          }}
        />
      </div>

      {/* Subtle tech grid behind */}
      <div className="absolute inset-[8%] rounded-full bg-tech-grid opacity-30 pointer-events-none z-0" />

      {/* Drifting lime glow shader */}
      <motion.div
        aria-hidden
        className="absolute left-1/4 top-1/4 w-1/2 h-1/2 rounded-full pointer-events-none z-30"
        style={{
          background: "radial-gradient(circle, rgba(190,240,48,0.22) 0%, transparent 65%)",
          willChange: "transform, opacity",
        }}
        animate={
          reducedMotion
            ? { opacity: 0.5 }
            : { x: ["-10%", "14%", "-4%", "-10%"], y: ["-6%", "8%", "16%", "-6%"], opacity: [0.4, 0.6, 0.4, 0.4] }
        }
        transition={reducedMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
