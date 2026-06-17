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
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s.id);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transition(0.55, 0, reducedMotion)}
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        backgroundColor: scrolled ? "rgba(10, 12, 9, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid transparent",
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
          <TyllerComplete size="sm" style={{ color: "var(--color-neutral-100)" }} />
        </motion.a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Seções da landing">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className="px-1 py-1.5 transition-colors cursor-pointer relative"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                color: activeSection === s.id ? "var(--color-brand-400)" : "var(--color-neutral-300)",
              }}
              onMouseEnter={(e) => {
                if (activeSection !== s.id) {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-100)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== s.id) {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-300)";
                }
              }}
            >
              {s.label}
              {activeSection === s.id && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--color-brand-400)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.04 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            onClick={goToAuth}
            className="px-3 py-1.5 cursor-pointer text-xs font-medium transition-colors"
            style={{
              fontFamily: "var(--font-family-body)",
              color: "var(--color-neutral-300)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-100)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-300)";
            }}
          >
            Entrar
          </motion.button>
          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.04, y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            onClick={goToAuth}
            className="btn-tech px-4 py-1.5 rounded-xl cursor-pointer text-xs hidden sm:inline-flex"
          >
            Começar gratuitamente
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
