import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const zEntries = Object.entries(tokens.primitive.zIndex);
const bpEntries = Object.entries(tokens.primitive.breakpoint);

export function ZIndexBreakpointSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="06"
        title="Z-Index & Breakpoints"
        description="Stacking order tokens for layered UI and responsive breakpoints for adaptive layout composition."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Z-Index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Z-Index Stack
          </h3>

          {/* Visual stack */}
          <div className="relative h-72 mb-8 rounded-xl overflow-hidden border border-neutral-800"
            style={{ backgroundColor: "var(--color-neutral-950)" }}>
            {[
              { key: "base", label: "base", z: 0, color: "#282d25", w: "90%", top: "60%" },
              { key: "raised", label: "raised", z: 10, color: "#3a4636", w: "75%", top: "48%" },
              { key: "dropdown", label: "dropdown", z: 100, color: "#4e5e49", w: "62%", top: "36%" },
              { key: "sticky", label: "sticky", z: 200, color: "#667a60", w: "50%", top: "24%" },
              { key: "overlay", label: "overlay", z: 300, color: "#86ae10", w: "38%", top: "12%" },
              { key: "modal", label: "modal", z: 400, color: "#a8d918", w: "26%", top: "3%" },
            ].map((layer, i) => (
              <motion.div
                key={layer.key}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.165, 0.84, 0.44, 1] }}
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-between px-4 rounded-lg h-10"
                style={{
                  width: layer.w,
                  top: layer.top,
                  backgroundColor: layer.color,
                  zIndex: layer.z,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "rgba(255,255,255,0.8)" }}>
                  z-{layer.key}
                </span>
                <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "rgba(255,255,255,0.4)" }}>
                  {layer.z}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="space-y-1">
            {zEntries.map(([key, token], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="flex items-center justify-between py-2 border-b border-neutral-800/50 group hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `hsl(${80 + i * 8}, 50%, ${30 + i * 5}%)` }}
                  />
                  <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-300)" }}>
                    --z-{key}
                  </span>
                </div>
                <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-400)" }}>
                  {token.$value}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Breakpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Responsive Breakpoints
          </h3>

          {/* Visual breakpoint bars */}
          <div className="mb-8 space-y-4">
            {bpEntries.map(([key, token], i) => {
              const maxPx = 1440;
              const px = parseInt(token.$value);
              const pct = (px / maxPx) * 100;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-300)" }}>
                      {key}
                    </span>
                    <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-400)" }}>
                      {token.$value}
                    </span>
                  </div>
                  {/* Device mockup bar */}
                  <div className="relative h-8 rounded-lg overflow-hidden"
                    style={{ backgroundColor: "var(--color-neutral-850)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08 + 0.2, ease: [0.165, 0.84, 0.44, 1] }}
                      className="h-full flex items-center justify-end pr-2 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, var(--color-neutral-800), var(--color-brand-800))`,
                        minWidth: "40px",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-brand-400)" }}>
                        {key}
                      </span>
                    </motion.div>
                    {/* Screen icon */}
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-40"
                      style={{ color: "var(--color-neutral-400)" }}
                    >
                      {key === "sm" ? "📱" : key === "md" ? "📱" : key === "lg" ? "💻" : "🖥️"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Device reference */}
          <div className="pt-6 border-t border-neutral-800">
            <p className="text-xs mb-4"
              style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-600)" }}>
              Device reference
            </p>
            <div className="space-y-2">
              {[
                { bp: "sm (640px)",  desc: "Large phones, small tablets" },
                { bp: "md (768px)",  desc: "Tablets, portrait" },
                { bp: "lg (1024px)", desc: "Laptops, landscape tablets" },
                { bp: "xl (1280px)", desc: "Desktops" },
                { bp: "2xl (1440px)",desc: "Large desktops, wide screens" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-500)", width: "7rem" }}>
                    {item.bp}
                  </span>
                  <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-500)" }}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
