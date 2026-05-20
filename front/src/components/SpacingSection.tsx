import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const spaceEntries = Object.entries(tokens.primitive.space);

export function SpacingSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="03"
        title="Spacing Scale"
        description="A consistent spacing system from 0 to 64 — used for padding, margin, gap, and layout composition."
      />

      <div className="space-y-2">
        {spaceEntries.map(([key, token], i) => {
          const pxValue = token.$value === "1px"
            ? 1
            : parseFloat(token.$value) * 16;
          const barWidth = Math.min((pxValue / 256) * 100, 100);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.025, ease: [0.165, 0.84, 0.44, 1] }}
              className="flex items-center gap-4 group py-1"
            >
              {/* Token name */}
              <div className="w-14 shrink-0 text-right">
                <span
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-neutral-400)",
                  }}
                >
                  {key}
                </span>
              </div>

              {/* Bar */}
              <div
                className="relative flex-1 h-7 rounded-md overflow-hidden"
                style={{ backgroundColor: "var(--color-neutral-900)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.max(barWidth, 1.5)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.025 + 0.2, ease: [0.165, 0.84, 0.44, 1] }}
                  className="h-full rounded-md flex items-center justify-end pr-2"
                  style={{
                    background: `linear-gradient(90deg, var(--color-brand-900), var(--color-brand-600))`,
                    minWidth: "6px",
                  }}
                />
              </div>

              {/* Value */}
              <div className="w-20 shrink-0">
                <span
                  className="group-hover:text-brand-300 transition-colors"
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  {token.$value}
                </span>
              </div>

              {/* Pixel value */}
              <div className="w-16 shrink-0">
                <span
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-700)",
                  }}
                >
                  {token.$value === "0rem" ? "0px" : token.$value === "1px" ? "1px" : `${pxValue}px`}
                </span>
              </div>

              {/* Visual block */}
              <div
                className="shrink-0 h-4 rounded-sm"
                style={{
                  width: `${Math.min(pxValue / 2, 120)}px`,
                  backgroundColor: "var(--color-brand-700)",
                  opacity: 0.5,
                  minWidth: "1px",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Grid visual demo */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
        className="mt-16 rounded-2xl border border-neutral-800 p-8"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        <h3
          className="text-xs uppercase tracking-widest mb-8"
          style={{
            fontFamily: "var(--font-family-mono)",
            color: "var(--color-neutral-500)",
            letterSpacing: "var(--letter-spacing-widest)",
          }}
        >
          Spacing Visual Reference
        </h3>
        <div className="flex flex-wrap gap-4 items-end">
          {["2", "4", "6", "8", "10", "12", "16", "20", "24"].map((s, i) => {
            const sp = tokens.primitive.space[s as keyof typeof tokens.primitive.space];
            if (!sp) return null;
            const px = parseFloat(sp.$value) * 16;
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ transformOrigin: "bottom" }}
                className="flex flex-col items-center gap-2"
              >
                <span
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-500)",
                  }}
                >
                  {sp.$value}
                </span>
                <div
                  style={{
                    width: `${Math.min(px * 0.7, 80)}px`,
                    height: `${Math.min(px * 0.7, 80)}px`,
                    background: `linear-gradient(135deg, var(--color-brand-800), var(--color-brand-600))`,
                    borderRadius: "var(--radius-sm)",
                    minWidth: "4px",
                    minHeight: "4px",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-brand-500)",
                  }}
                >
                  {s}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
