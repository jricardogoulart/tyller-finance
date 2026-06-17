import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import TyllerComplete from "../layout/TyllerComplete";
import { goToAuth, scrollToSection, transition } from "./motion";

const SECTIONS = [
  { id: "features", label: "Recursos" },
  { id: "how-it-works", label: "Como funciona" },
  { id: "pricing", label: "Planos" },
];

export function LandingNav() {
  const reducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transition(0.55, 0, reducedMotion)}
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        backgroundColor: scrolled ? "rgba(10, 12, 9, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-neutral-900)" : "1px solid transparent",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
        <motion.a
          href="#/"
          whileHover={reducedMotion ? undefined : { scale: 1.04 }}
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          className="flex items-center gap-2 cursor-pointer"
          aria-label="Tyller Finance — início"
        >
          <TyllerComplete size="md" style={{ color: "var(--color-neutral-100)" }} />
        </motion.a>

        <nav className="hidden md:flex items-center gap-1" aria-label="Seções da landing">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-neutral-500)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-200)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-500)";
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.04, y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            onClick={goToAuth}
            className="btn-tech-outline px-3.5 py-1.5 rounded-xl cursor-pointer text-xs font-medium"
          >
            Entrar
          </motion.button>
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.04, y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            onClick={goToAuth}
            className="btn-tech px-3.5 py-1.5 rounded-xl cursor-pointer text-xs hidden sm:inline-flex"
          >
            Começar grátis
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
