import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const radiusEntries = Object.entries(tokens.primitive.radius);
const shadowEntries = Object.entries(tokens.primitive.shadow);

export function RadiusShadowSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="05"
        title="Radius & Shadow"
        description="Border radius scale from sharp edges to fully circular, and depth-defining shadow tokens from subtle to immersive."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Radius */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
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
            Border Radius
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {radiusEntries.map(([key, token], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-16 h-16"
                  style={{
                    borderRadius: key === "full" ? "9999px" : token.$value,
                    background:
                      "linear-gradient(135deg, var(--color-brand-800), var(--color-brand-500))",
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-neutral-300)",
                    }}
                  >
                    {key}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-600)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {token.$value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive comparison */}
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <p
              className="text-xs mb-4"
              style={{
                fontFamily: "var(--font-family-mono)",
                color: "var(--color-neutral-600)",
                letterSpacing: "var(--letter-spacing-wide)",
              }}
            >
              Radius applied to a card:
            </p>
            <div className="flex flex-wrap gap-3">
              {["none", "sm", "lg", "2xl", "full"].map((key, i) => {
                const r = tokens.primitive.radius[key as keyof typeof tokens.primitive.radius];
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="w-16 h-10 border border-brand-700 flex items-center justify-center"
                    style={{
                      borderRadius: r.$value,
                      backgroundColor: "var(--color-neutral-850)",
                      borderColor: "var(--color-brand-700)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontSize: "var(--font-size-2xs)",
                        color: "var(--color-brand-400)",
                      }}
                    >
                      {key}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Shadows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
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
            Shadow Scale
          </h3>
          <div className="space-y-5">
            {shadowEntries.map(([key, token], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.165, 0.84, 0.44, 1] }}
                className="flex items-center gap-5"
              >
                {/* Shadow box */}
                <div
                  className="w-14 h-14 shrink-0 rounded-xl"
                  style={{
                    backgroundColor: "var(--color-neutral-800)",
                    boxShadow: token.$value,
                    border: "1px solid var(--color-neutral-700)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-neutral-300)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    shadow-{key}
                  </div>
                  <div
                    className="truncate"
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-600)",
                    }}
                  >
                    {token.$value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
