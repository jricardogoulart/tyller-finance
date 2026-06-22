import { motion, AnimatePresence } from "framer-motion";

/**
 * Small green dots burst upward — used in HowItWorksTimeline step 3.
 */
export function ParticlesBurst({ trigger }: { trigger: boolean }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 120 - 60,
    delay: Math.random() * 0.4,
    id: i,
  }));

  return (
    <AnimatePresence>
      {trigger &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: "var(--color-brand-400)",
              top: "50%",
              left: "50%",
            }}
            initial={{ opacity: 1, y: 0, x: p.x }}
            animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
          />
        ))}
    </AnimatePresence>
  );
}

/**
 * Confetti micro-burst — used on Pricing CTA hover/click.
 */
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const items = Array.from({ length: 20 }, (_, i) => ({
    x: (Math.random() - 0.5) * 160,
    y: (Math.random() - 0.5) * 80,
    rotate: Math.random() * 360,
    color: ["#bef030", "#ffffff", "#7f77dd"][i % 3],
    id: i,
  }));

  return (
    <AnimatePresence>
      {trigger &&
        items.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-sm pointer-events-none"
            style={{
              backgroundColor: p.color,
              top: "50%",
              left: "50%",
            }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
            exit={{}}
            transition={{ duration: 0.8, ease: "easeOut", delay: p.id * 0.02 }}
          />
        ))}
    </AnimatePresence>
  );
}
