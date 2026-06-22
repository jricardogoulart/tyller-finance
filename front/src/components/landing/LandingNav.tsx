import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import TyllerComplete from "../layout/TyllerComplete";
import { goToAuth, scrollToSection, ease06 } from "./motion";

const SECTIONS = [
  { id: "features", label: "Recursos" },
  { id: "how-it-works", label: "Como funciona" },
  { id: "pricing", label: "Planos" },
];

export function LandingNav() {
  // ── Scroll-linked values ──────────────────────────────────────────────────
  const { scrollY, scrollYProgress } = useScroll();

  // Nav blur + background opacity (0→80px scroll)
  const blurRaw = useTransform(scrollY, [0, 80], [0, 16]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.88]);
  const navBlur = useMotionTemplate`blur(${blurRaw}px)`;
  const navBg = useMotionTemplate`rgba(10,12,9,${bgOpacity})`;

  // Border opacity
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.06]);
  const navBorder = useMotionTemplate`rgba(255,255,255,${borderOpacity})`;

  // Logo scale shrinks as user scrolls
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.85]);

  // Reading progress bar — smooth spring
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });

  return (
    <>
      {/* Reading progress bar */}
      <motion.div
        className="fixed bottom-0 left-0 z-[60] h-[2px] w-full origin-left"
        style={{
          scaleX,
          backgroundColor: "var(--color-brand-400)",
        }}
        aria-hidden
      />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ease06}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: navBlur,
          backgroundColor: navBg,
          borderBottom: useMotionTemplate`1px solid ${navBorder}`,
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between h-14">
          {/* Logo with scroll shrink */}
          <motion.a
            href="#/"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 cursor-pointer origin-left"
            style={{ scale: logoScale }}
            aria-label="Tyller Finance — início"
          >
            <TyllerComplete size="lg" style={{ color: "var(--color-neutral-100)" }} />
          </motion.a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Seções da landing">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className="px-1 py-1.5 transition-colors cursor-pointer relative group"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-neutral-300)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-100)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-neutral-300)";
                }}
              >
                {s.label}
                {/* Animated underline on hover */}
                <span
                  className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-200"
                  style={{ backgroundColor: "var(--color-brand-400)" }}
                  aria-hidden
                />
              </button>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
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
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={goToAuth}
              className="btn-tech px-4 py-1.5 rounded-xl cursor-pointer text-xs hidden sm:inline-flex"
            >
              Começar gratuitamente
            </motion.button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
