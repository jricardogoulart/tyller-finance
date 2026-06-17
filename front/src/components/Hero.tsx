import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TyllerComplete from "./layout/TyllerComplete";

const NAV_SECTIONS = [
  { id: "colors",     label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing",    label: "Spacing" },
  { id: "motion",     label: "Motion" },
  { id: "radius",     label: "Radius & Shadow" },
  { id: "zindex",     label: "Z-Index" },
  { id: "components", label: "Components" },
  { id: "explorer",   label: "Token Explorer" },
];

function MarqueeText() {
  const items = [
    "Color", "Typography", "Spacing", "Motion", "Easing",
    "Shadow", "Radius", "Z-Index", "Breakpoints", "Components",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8"
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-neutral-600)",
              letterSpacing: "var(--letter-spacing-wider)",
              textTransform: "uppercase",
            }}
          >
            {item}
            <span style={{ color: "var(--color-brand-700)" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type AppRoute = 'app' | 'design-system' | 'user-space' | 'perfil';

interface HeroProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute | 'landing' | 'auth') => void;
}

export function Hero({ currentRoute, onNavigate }: HeroProps) {
  const { user, workspace, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (currentRoute !== 'design-system') {
      onNavigate('design-system');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <>
      {/* Sticky Nav */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          backgroundColor: scrolled ? "rgba(10, 12, 9, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-neutral-900)" : "1px solid transparent",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => onNavigate('app')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <TyllerComplete className="h-7 w-auto" />
            </motion.div>
            <span
              className="hidden md:block px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                color: "var(--color-brand-500)",
                backgroundColor: "var(--color-brand-950)",
                border: "1px solid var(--color-brand-800)",
              }}
            >
              v1.0.0
            </span>
          </div>


          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentRoute === 'design-system' ? (
              NAV_SECTIONS.slice(0, 7).map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-xs)",
                    color: activeSection === s.id ? "var(--color-brand-400)" : "var(--color-neutral-500)",
                    backgroundColor: activeSection === s.id ? "var(--color-brand-950)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-200)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = activeSection === s.id ? "var(--color-brand-400)" : "var(--color-neutral-500)";
                  }}
                >
                  {s.label}
                </button>
              ))
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-neutral-500)",
                }}
              >
                ◆ Seu Assistente Financeiro Pessoal
              </span>
            )}
          </nav>

          {/* User Profile & Session controls */}
          <div className="flex items-center gap-2">
            {currentRoute !== 'app' && (
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => onNavigate('app')}
                className="btn-tech-outline px-3.5 py-1.5 rounded-xl cursor-pointer text-xs flex items-center gap-1 font-medium"
              >
                Painel
              </motion.button>
            )}

            {currentRoute !== 'user-space' && workspace && (
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => onNavigate('user-space')}
                className="btn-tech-outline px-3.5 py-1.5 rounded-xl cursor-pointer text-xs flex items-center gap-1 font-medium"
                style={{
                  backgroundColor: "rgba(190, 240, 48, 0.08)",
                  borderColor: "rgba(190, 240, 48, 0.3)",
                }}
              >
                Área do Usuário
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, translateY: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={logout}
              className="btn-glass-premium px-3.5 py-1.5 rounded-xl cursor-pointer text-xs flex items-center gap-1 font-medium"
              title="Sair"
            >
              <span className="hidden sm:inline">Sair</span>
              <svg 
                className="inline sm:hidden" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero section */}
      {currentRoute === 'design-system' && (
        <section
          className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-14"
          style={{ backgroundColor: "transparent" }}
        >

        {/* Main content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-24">
          {/* Pre-label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <span
              className="px-3 py-1 rounded-full"
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-brand-400)",
                backgroundColor: "var(--color-brand-950)",
                border: "1px solid var(--color-brand-800)",
                letterSpacing: "var(--letter-spacing-wide)",
              }}
            >
              ◆ Design System
            </span>
            <div className="h-px w-12" style={{ backgroundColor: "var(--color-neutral-800)" }} />
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-neutral-600)",
              }}
            >
              Code Resolution®
            </span>
          </motion.div>

          {/* Heading */}
          <div className="animate-float-slow relative select-none">
            {/* Ambient Title Glow */}
            <div 
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-glow-lime blur-[120px] opacity-15 pointer-events-none z-[-1]"
              style={{ mixBlendMode: "screen" }}
            />

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                fontWeight: "var(--font-weight-medium)",
                lineHeight: "var(--line-height-tight)",
                letterSpacing: "var(--letter-spacing-tighter)",
                maxWidth: "900px",
              }}
            >
              <span className="text-gradient-hero-loop">Motion</span>
              <span className="text-gradient-brand-loop"> Design</span>
              <br />
              <span className="text-gradient-hero-loop">System</span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.165, 0.84, 0.44, 1] }}
            className="mt-6 max-w-xl"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-lg)",
              color: "var(--color-neutral-400)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            A comprehensive token-driven system — all primitive CSS variables, interactive
            motion demos, and component previews. Built on the Code Resolution® aesthetic.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
            className="flex flex-wrap gap-8 mt-12"
          >
            {[
              { num: "130+", label: "CSS Tokens" },
              { num: "8",    label: "Token Categories" },
              { num: "5",    label: "Easing Curves" },
              { num: "11",   label: "GSAP Easings" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex flex-col gap-0.5"
              >
                <span
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-brand-400)",
                    lineHeight: "var(--line-height-none)",
                  }}
                >
                  {stat.num}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-neutral-500)",
                    letterSpacing: "var(--letter-spacing-wide)",
                  }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("colors")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer"
              style={{
                backgroundColor: "var(--color-brand-400)",
                color: "var(--color-neutral-950)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-regular)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Explore Tokens
              <span>→</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("explorer")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-neutral-300)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-regular)",
                border: "1px solid var(--color-neutral-800)",
              }}
            >
              Token Explorer
            </motion.button>
          </motion.div>
        </div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="relative z-10 border-t border-neutral-900 py-4"
        >
          <MarqueeText />
        </motion.div>
        </section>
      )}
    </>
  );
}
