import type { Transition, Variants } from "framer-motion";

export const EASE_DEFAULT = [0.165, 0.84, 0.44, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const viewportOnce = { once: true, margin: "-80px" as const };

export function transition(
  duration = 0.6,
  delay = 0,
  reducedMotion?: boolean | null,
): Transition {
  if (reducedMotion) {
    return { duration: 0.01, delay: 0 };
  }
  return { duration, delay, ease: EASE_DEFAULT };
}

export function goToAuth() {
  window.location.hash = "#/auth";
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
