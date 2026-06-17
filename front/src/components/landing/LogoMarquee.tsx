import { motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  Braces,
  Cloud,
  Code2,
  Database,
  Layers,
  Server,
  Sparkles,
} from "lucide-react";
import { fadeIn, transition } from "./motion";

const STACK = [
  { label: "React", Icon: Layers },
  { label: "TypeScript", Icon: Braces },
  { label: "Node.js", Icon: Server },
  { label: "AI / ML", Icon: Bot },
  { label: "Tailwind CSS", Icon: Code2 },
  { label: "Framer Motion", Icon: Sparkles },
  { label: "PostgreSQL", Icon: Database },
  { label: "Cloud", Icon: Cloud },
];

function MarqueeTrack({ speedClass }: { speedClass: string }) {
  const doubled = [...STACK, ...STACK];
  return (
    <div
      className="overflow-hidden w-full"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
      aria-hidden
    >
      <div className={`flex gap-10 ${speedClass} whitespace-nowrap`} style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="flex items-center gap-3 shrink-0"
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-neutral-500)",
              letterSpacing: "var(--letter-spacing-wider)",
              textTransform: "uppercase",
            }}
          >
            <item.Icon size={16} style={{ color: "var(--color-brand-500)" }} />
            {item.label}
            <span style={{ color: "var(--color-brand-700)" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      transition={transition(0.6, 0, reducedMotion)}
      className="relative z-10 border-y border-neutral-900 py-5"
      aria-label="Stack tecnológica"
    >
      <p
        className="text-center mb-4 px-4"
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-2xs)",
          color: "var(--color-neutral-600)",
          letterSpacing: "var(--letter-spacing-widest)",
          textTransform: "uppercase",
        }}
      >
        Construído com tecnologia de ponta
      </p>
      <MarqueeTrack speedClass={reducedMotion ? "" : "animate-marquee"} />
      {reducedMotion && (
        <div className="flex flex-wrap justify-center gap-4 mt-4 px-4">
          {STACK.map((item) => (
            <span key={item.label} className="ds-badge ds-badge-neutral">
              {item.label}
            </span>
          ))}
        </div>
      )}
    </motion.section>
  );
}
