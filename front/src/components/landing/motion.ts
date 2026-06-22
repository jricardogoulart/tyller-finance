import type { Variants, Transition } from "framer-motion";

// ─── Transitions base ────────────────────────────────────────────────────────

export const spring = (stiffness = 300, damping = 30): Transition => ({
  type: "spring",
  stiffness,
  damping,
});

export const springFast: Transition = spring(400, 40);
export const springMed: Transition = spring(300, 30);
export const springSlow: Transition = spring(200, 30);

export const ease04: Transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };
export const ease06: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

// ─── Legacy compat (used by some components) ─────────────────────────────────

export const EASE_DEFAULT = [0.165, 0.84, 0.44, 1] as const;

export function transition(
  duration = 0.6,
  delay = 0,
  reducedMotion?: boolean | null,
): Transition {
  if (reducedMotion) return { duration: 0.01, delay: 0 };
  return { duration, delay, ease: EASE_DEFAULT };
}

// ─── Variants reutilizáveis ───────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: springMed },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: ease04 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springMed },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: springMed },
};

export const pushNotif: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springFast, delay: 0.2 },
  },
};

// ─── Stagger containers ───────────────────────────────────────────────────────

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Hero cascade — stagger 120ms */
export const heroCascade = staggerContainer(0.12, 0.1);

/** Bento grid — stagger 80ms */
export const bentoGrid = staggerContainer(0.08, 0.15);

// ─── Hover / Tap ──────────────────────────────────────────────────────────────

export const hoverLift = {
  whileHover: { scale: 1.02, y: -4, transition: springSlow },
  whileTap: { scale: 0.97, transition: springFast },
};

export const hoverGlow = {
  whileHover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 0 0 1px #bef030, 0 8px 32px rgba(190,240,48,0.18)",
    transition: springSlow,
  },
  whileTap: { scale: 0.97 },
};

// ─── ScrollScene exit (afundamento) ──────────────────────────────────────────

export const scrollExitSink: Variants = {
  visible: { scale: 1, filter: "blur(0px)", opacity: 1 },
  exit: { scale: 0.95, filter: "blur(3px)", opacity: 0, transition: ease04 },
};

// ─── Clip-path reveals ───────────────────────────────────────────────────────

export const clipRevealUp: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: ease06 },
};

export const clipRevealDiag: Variants = {
  hidden: { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
  visible: {
    clipPath: "polygon(0 15%, 100% 0%, 100% 100%, 0 100%)",
    transition: ease06,
  },
};

// ─── Shake variant ────────────────────────────────────────────────────────────

export const shakeVariant: Variants = {
  shake: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.4, delay: 0.5 },
  },
};

// ─── Shared viewport config ───────────────────────────────────────────────────

export const viewportOnce = { once: true, margin: "-80px" as const };

// ─── Navigation helpers ───────────────────────────────────────────────────────

export function goToAuth() {
  window.location.hash = "#/auth";
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Premium section transition effects ──────────────────────────────────────────

export const sectionFadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(2px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

export const pricingCardReveal: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
  },
};

export const timelineItemReveal: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
  },
};

export const smoothHoverElevation = {
  whileHover: { 
    y: -8, 
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
  },
  whileTap: { scale: 0.98, transition: springFast },
};
