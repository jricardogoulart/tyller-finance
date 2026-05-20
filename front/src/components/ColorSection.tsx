import { motion } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const colorGroups = [
  { name: "brand", label: "Brand", shades: tokens.primitive.color.brand },
  { name: "neutral", label: "Neutral", shades: tokens.primitive.color.neutral },
  { name: "success", label: "Success", shades: tokens.primitive.color.success },
  { name: "warning", label: "Warning", shades: tokens.primitive.color.warning },
  { name: "error", label: "Error", shades: tokens.primitive.color.error },
  { name: "info", label: "Info", shades: tokens.primitive.color.info },
];

function ColorSwatch({ name, shade, value, delay }: { name: string; shade: string; value: string; delay: number }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay, ease: [0.165, 0.84, 0.44, 1] }}
      whileHover={{ y: -4, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={copy}
      className="group relative flex flex-col gap-2 cursor-pointer"
      title={`Copy ${value}`}
    >
      <div
        className="w-full aspect-square rounded-lg border border-white/5 shadow-md transition-shadow group-hover:shadow-xl"
        style={{ backgroundColor: value }}
      />
      <div className="text-left">
        <div
          className="text-mono text-2xs font-medium leading-none mb-0.5"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-300)",
          }}
        >
          {name}-{shade}
        </div>
        <div
          className="text-mono text-2xs leading-none"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-500)",
          }}
        >
          {copied ? "✓ copied" : value}
        </div>
      </div>
    </motion.button>
  );
}

function ColorGroup({ name, label, shades, groupDelay }: {
  name: string;
  label: string;
  shades: Record<string, { $value: string }>;
  groupDelay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: groupDelay, ease: [0.165, 0.84, 0.44, 1] }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-family-mono)",
            color: "var(--color-neutral-400)",
            letterSpacing: "var(--letter-spacing-widest)",
          }}
        >
          {label}
        </span>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: "var(--color-neutral-800)" }}
        />
        <span
          className="text-2xs"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-600)",
          }}
        >
          {Object.keys(shades).length} shades
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
        {Object.entries(shades).map(([shade, token], i) => (
          <ColorSwatch
            key={shade}
            name={name}
            shade={shade}
            value={token.$value}
            delay={groupDelay + i * 0.03}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ColorSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="01"
        title="Color Palette"
        description="Semantic color tokens built on a nature-forward brand palette. Each shade from 50 (lightest) to 950 (darkest) — click any swatch to copy its hex value."
      />

      {/* White / Black specials */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex gap-4 mb-10"
      >
        {["white", "black"].map((key) => {
          const val = key === "white" ? "#ffffff" : "#000000";
          return (
            <button
              key={key}
              onClick={() => navigator.clipboard.writeText(val)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg border border-neutral-800 hover:border-neutral-600 transition-colors"
              style={{ backgroundColor: "var(--color-neutral-900)" }}
            >
              <div
                className="w-6 h-6 rounded-md border border-white/10"
                style={{ backgroundColor: val }}
              />
              <span
                className="text-2xs"
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-neutral-300)",
                }}
              >
                {key} — {val}
              </span>
            </button>
          );
        })}
      </motion.div>

      {colorGroups.map((group, i) => (
        <ColorGroup
          key={group.name}
          name={group.name}
          label={group.label}
          shades={group.shades as Record<string, { $value: string }>}
          groupDelay={i * 0.05}
        />
      ))}
    </section>
  );
}
