import { motion } from "framer-motion";

interface SectionHeaderProps {
  index: string;
  title: string;
  description: string;
}

export function SectionHeader({ index, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
      className="mb-12"
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
