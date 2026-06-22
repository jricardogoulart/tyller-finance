import { motion } from "framer-motion";
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
import { clipRevealUp } from "./motion";

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
      style={{
        // Fade masks — soft edges so the marquee blends into the page
        maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
      aria-hidden
    >
      <div
        className={`flex gap-10 ${speedClass} whitespace-nowrap`}
        style={{ width: "max-content" }}
      >
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
  return (
    // Clip-path reveal as section enters viewport
    <motion.section
      variants={clipRevealUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 border-y border-neutral-900 py-4"
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
      <MarqueeTrack speedClass="animate-marquee" />
    </motion.section>
  );
}
