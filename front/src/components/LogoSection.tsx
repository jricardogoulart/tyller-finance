import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import TyllerIcon from "./layout/Tyller";
import TyllerWordmark from "./layout/TyllerComplete";
import type { LogoSize } from "./layout/Tyller";

const SIZES: { size: LogoSize; label: string; description: string }[] = [
  { size: "xs",  label: "xs",  description: "Inline / favicon" },
  { size: "sm",  label: "sm",  description: "Dense UI / badges" },
  { size: "md",  label: "md",  description: "Default / nav bar" },
  { size: "lg",  label: "lg",  description: "Cards / headings" },
  { size: "xl",  label: "xl",  description: "Hero / banners" },
  { size: "2xl", label: "2xl", description: "Display / splash" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.165, 0.84, 0.44, 1] as const } },
};

// ── Single icon row card ──────────────────────────────────────────────────────
function IconCard({ size, label, description }: { size: LogoSize; label: string; description: string }) {
  const SIZE_PX: Record<LogoSize, number> = { xs: 16, sm: 24, md: 32, lg: 48, xl: 64, "2xl": 96 };
  const px = SIZE_PX[size];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex items-center gap-5 rounded-xl px-5 py-4 border transition-colors"
      style={{
        background: "var(--color-neutral-900)",
        borderColor: "var(--color-neutral-800)",
      }}
    >
      {/* Icon preview — fixed-height cell so cards align */}
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 96, height: 96 }}
      >
        <TyllerIcon size={size} style={{ color: "var(--color-brand-400)" }} />
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: "var(--color-neutral-100)", fontFamily: "var(--font-family-mono)" }}
          >
            {label}
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "var(--color-neutral-500)", fontFamily: "var(--font-family-mono)" }}
          >
            {px}px
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: "var(--color-neutral-500)", fontFamily: "var(--font-family-sans)" }}
        >
          {description}
        </span>
      </div>
    </motion.div>
  );
}

// ── Wordmark row ──────────────────────────────────────────────────────────────
function WordmarkCard({ size, label, description }: { size: LogoSize; label: string; description: string }) {
  const WORDMARK_H: Record<LogoSize, number> = { xs: 12, sm: 16, md: 24, lg: 32, xl: 48, "2xl": 72 };
  const h = WORDMARK_H[size];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex items-center gap-5 rounded-xl px-5 py-4 border transition-colors"
      style={{
        background: "var(--color-neutral-900)",
        borderColor: "var(--color-neutral-800)",
      }}
    >
      {/* Wordmark preview */}
      <div
        className="flex items-center flex-shrink-0"
        style={{ width: 200, height: 72 }}
      >
        <TyllerWordmark size={size} style={{ color: "var(--color-neutral-100)" }} />
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: "var(--color-neutral-100)", fontFamily: "var(--font-family-mono)" }}
          >
            {label}
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: "var(--color-neutral-500)", fontFamily: "var(--font-family-mono)" }}
          >
            {h}px height
          </span>
        </div>
        <span
          className="text-xs"
          style={{ color: "var(--color-neutral-500)", fontFamily: "var(--font-family-sans)" }}
        >
          {description}
        </span>
      </div>
    </motion.div>
  );
}

// ── Combined logo (icon + wordmark) banner ────────────────────────────────────
function LogoBanner({ size }: { size: LogoSize }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="flex items-center gap-3 rounded-xl px-6 py-5 border"
      style={{
        background: "var(--color-neutral-900)",
        borderColor: "var(--color-neutral-800)",
      }}
    >
      <TyllerIcon
        size={size}
        style={{ color: "var(--color-brand-400)", flexShrink: 0 }}
      />
      <TyllerWordmark
        size={size}
        style={{ color: "var(--color-neutral-100)" }}
      />
    </motion.div>
  );
}

// ── Main section export ───────────────────────────────────────────────────────
export function LogoSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="00"
        title="Logo & Brand Mark"
        description="Semantic size tokens for the Tyller icon mark and wordmark. All sizes integrate seamlessly with the design system spacing scale — xs through 2xl."
      />

      {/* ── Icon mark grid ── */}
      <div
        className="mb-4"
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-neutral-400)",
          letterSpacing: "var(--letter-spacing-widest)",
          textTransform: "uppercase",
        }}
      >
        Icon Mark — <code style={{ color: "var(--color-brand-400)" }}>&lt;TyllerIcon size="…" /&gt;</code>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12"
      >
        {SIZES.map(({ size, label, description }) => (
          <IconCard key={size} size={size} label={label} description={description} />
        ))}
      </motion.div>

      {/* ── Wordmark grid ── */}
      <div
        className="mb-4"
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-neutral-400)",
          letterSpacing: "var(--letter-spacing-widest)",
          textTransform: "uppercase",
        }}
      >
        Wordmark — <code style={{ color: "var(--color-brand-400)" }}>&lt;TyllerWordmark size="…" /&gt;</code>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12"
      >
        {SIZES.map(({ size, label, description }) => (
          <WordmarkCard key={size} size={size} label={label} description={description} />
        ))}
      </motion.div>

      {/* ── Combined lockup previews ── */}
      <div
        className="mb-4"
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-neutral-400)",
          letterSpacing: "var(--letter-spacing-widest)",
          textTransform: "uppercase",
        }}
      >
        Combined Lockup — Icon + Wordmark
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {SIZES.map(({ size, label }) => (
          <div key={size} className="flex flex-col gap-2">
            <LogoBanner size={size} />
            <span
              className="text-center"
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                color: "var(--color-neutral-600)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
