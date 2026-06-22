import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  index: string;
  title: string;
  description: ReactNode;
  className?: string;
  variant?: "default" | "features";
  socialProof?: string;
}

export function SectionHeader({
  index,
  title,
  description,
  className = "",
  variant = "default",
  socialProof,
}: SectionHeaderProps) {
  const reducedMotion = useReducedMotion();

  if (variant === "features") {
    return (
      <motion.header
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reducedMotion ? 0.01 : 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        className={`section-header--features mb-12 ${className}`.trim()}
      >
        <span className="section-header__index" aria-hidden="true">
          {index}
        </span>
        <div className="section-header__rule" aria-hidden="true" />
        <h2 className="section-header__title">{title}</h2>
        <p className="section-header__desc">{description}</p>
        {socialProof && (
          <p className="section-header__social">{socialProof}</p>
        )}
      </motion.header>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reducedMotion ? 0.01 : 0.6, ease: [0.165, 0.84, 0.44, 1] }}
      className={`mb-12 ${className}`.trim()}
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-mono text-xs text-neutral-500 tracking-widest uppercase">{index}</span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
      <h2
        className="text-4xl font-bold mb-3 text-neutral-50"
        style={{
          fontFamily: "var(--font-family-body)",
          letterSpacing: "var(--letter-spacing-tight)",
          lineHeight: "var(--line-height-tight)",
        }}
      >
        {title}
      </h2>
      <p className="text-neutral-400 text-base max-w-xl" style={{ lineHeight: "var(--line-height-relaxed)" }}>
        {description}
      </p>
    </motion.div>
  );
}
