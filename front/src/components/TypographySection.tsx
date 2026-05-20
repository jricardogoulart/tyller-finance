import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const fontSizes = Object.entries(tokens.primitive.font.size);
const fontWeights = Object.entries(tokens.primitive.font.weight);
const lineHeights = Object.entries(tokens.primitive.font.lineHeight);
const letterSpacings = Object.entries(tokens.primitive.font.letterSpacing);
const fontFamilies = Object.entries(tokens.primitive.font.family);

function TokenRow({ label, value, delay, children }: {
  label: string;
  value: string;
  delay: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.165, 0.84, 0.44, 1] }}
      className="flex items-center gap-4 py-3 border-b border-neutral-800/60 group hover:border-neutral-700 transition-colors"
    >
      <div className="w-28 shrink-0">
        <span
          className="token-code"
          style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
      <div className="shrink-0">
        <span
          className="opacity-0 group-hover:opacity-100 transition-opacity text-2xs"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-500)",
          }}
        >
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function TypographySection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="02"
        title="Typography"
        description="Type scales, font families, weights, line heights, and letter spacing — the complete typographic foundation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Font Families */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-6"
            style={{ color: "var(--color-neutral-400)", fontFamily: "var(--font-family-mono)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Font Families
          </h3>
          {fontFamilies.map(([key, token]) => (
            <div key={key} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="token-code">{key}</span>
              </div>
              <div
                style={{
                  fontFamily: token.$value,
                  fontSize: key === "display" ? "var(--font-size-2xl)" : "var(--font-size-xl)",
                  color: "var(--color-neutral-100)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                {key === "display" && "Agency Growth Partner"}
                {key === "body" && "Precision in every pixel."}
                {key === "mono" && "const resolve = () => {}"}
              </div>
              <div className="mt-1 text-xs" style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-600)", fontSize: "var(--font-size-2xs)" }}>
                {token.$value.split(",")[0].replace(/'/g, "")}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Font Sizes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-neutral-400)", fontFamily: "var(--font-family-mono)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Font Sizes
          </h3>
          <div className="space-y-1 overflow-hidden">
            {fontSizes.map(([key, token], i) => (
              <TokenRow key={key} label={key} value={token.$value} delay={i * 0.03}>
                <span
                  className="truncate block"
                  style={{
                    fontSize: token.$value,
                    color: "var(--color-neutral-100)",
                    lineHeight: "1.2",
                    maxHeight: "1.4em",
                    overflow: "hidden",
                  }}
                >
                  Aa
                </span>
              </TokenRow>
            ))}
          </div>
        </motion.div>

        {/* Font Weights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.165, 0.84, 0.44, 1] }}
          className="rounded-2xl border border-neutral-800 p-6"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-neutral-400)", fontFamily: "var(--font-family-mono)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Font Weights
          </h3>
          {fontWeights.map(([key, token], i) => (
            <TokenRow key={key} label={key} value={String(token.$value)} delay={i * 0.04}>
              <span
                style={{
                  fontWeight: token.$value,
                  fontSize: "var(--font-size-xl)",
                  color: "var(--color-neutral-100)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Design with purpose
              </span>
            </TokenRow>
          ))}
        </motion.div>

        {/* Line Heights & Letter Spacing */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
            className="rounded-2xl border border-neutral-800 p-6"
            style={{ backgroundColor: "var(--color-neutral-900)" }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--color-neutral-400)", fontFamily: "var(--font-family-mono)", letterSpacing: "var(--letter-spacing-widest)" }}>
              Line Heights
            </h3>
            {lineHeights.map(([key, token], i) => (
              <TokenRow key={key} label={key} value={String(token.$value)} delay={i * 0.04}>
                <div
                  className="border-l-2 pl-3"
                  style={{
                    borderColor: "var(--color-brand-700)",
                    lineHeight: token.$value,
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-neutral-200)",
                  }}
                >
                  Growth through<br />precision craft
                </div>
              </TokenRow>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.165, 0.84, 0.44, 1] }}
            className="rounded-2xl border border-neutral-800 p-6"
            style={{ backgroundColor: "var(--color-neutral-900)" }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--color-neutral-400)", fontFamily: "var(--font-family-mono)", letterSpacing: "var(--letter-spacing-widest)" }}>
              Letter Spacing
            </h3>
            {letterSpacings.map(([key, token], i) => (
              <TokenRow key={key} label={key} value={token.$value} delay={i * 0.04}>
                <span
                  style={{
                    letterSpacing: token.$value,
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-neutral-100)",
                    fontFamily: "var(--font-family-body)",
                    textTransform: "uppercase",
                  }}
                >
                  RESOLUTION
                </span>
              </TokenRow>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Premium Gradients & Typography Effects ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        className="mt-12 rounded-2xl border border-neutral-800 p-8 overflow-hidden relative"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "200px",
            background: "radial-gradient(ellipse at center, rgba(255, 109, 41, 0.08) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative z-10">
          <h3
            className="text-xs uppercase tracking-widest mb-2"
            style={{
              color: "var(--color-brand-400)",
              fontFamily: "var(--font-family-mono)",
              letterSpacing: "var(--letter-spacing-widest)",
            }}
          >
            02.1 · Premium Gradients & Typography Effects
          </h3>
          <p
            className="text-sm mb-8 max-w-xl"
            style={{
              fontFamily: "var(--font-family-body)",
              color: "var(--color-neutral-400)",
              lineHeight: "var(--line-height-relaxed)",
            }}
          >
            Advanced typographical layout primitives combining top-down opacity layers and 
            back-projected radial copper accent glows to reveal background structures.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Preview */}
            <div className="rounded-xl border border-neutral-800/80 p-6 flex flex-col justify-center items-center relative overflow-hidden bg-neutral-950/40 min-h-[220px]">
              {/* Back-projected radial glow copper orb */}
              <div className="absolute w-36 h-36 rounded-full bg-glow-warm pointer-events-none filter blur-xl opacity-80" />

              <h1
                className="text-gradient-glass text-center leading-none tracking-tight relative z-10 mb-2"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Neue Montreal
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-2xs)",
                  color: "var(--color-neutral-500)",
                  letterSpacing: "var(--letter-spacing-wide)",
                }}
                className="relative z-10"
              >
                Translucent vertical gradient · Copper glow reveal
              </p>
            </div>

            {/* Documentation & Token Code */}
            <div className="flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-neutral-200)",
                    }}
                    className="mb-1"
                  >
                    Glass Translucent Gradient
                  </h4>
                  <p
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Use class <span className="token-code">.text-gradient-glass</span> on display headings. It creates a sleek top-to-bottom metallic fade that lets the background orbs shine through the glyph structures.
                  </p>
                </div>

                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-neutral-200)",
                    }}
                    className="mb-1"
                  >
                    Warm Back-Glow Orb
                  </h4>
                  <p
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Use class <span className="token-code">.bg-glow-warm</span> on a background blur container to place the deep copper-orange spotlight behind your transparent text headers.
                  </p>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="mt-6 p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-left">
                <pre
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-400)",
                    lineHeight: "1.4",
                  }}
                  className="whitespace-pre-wrap overflow-x-auto"
                >
{`.text-gradient-glass {
  background: linear-gradient(to bottom, #ffffff 30%, rgba(255, 255, 255, 0.18) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Gradients Color & Heading Level Showcase */}
          <div className="mt-12 pt-8 border-t border-neutral-800/80 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Column 1: Color Channels */}
            <div>
              <h4
                className="text-xs uppercase tracking-widest mb-6"
                style={{
                  color: "var(--color-neutral-400)",
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "var(--letter-spacing-widest)",
                }}
              >
                Color Channel Gradients
              </h4>
              <div className="space-y-4">
                {[
                  {
                    title: "Neutral Glass",
                    class: ".text-gradient-glass",
                    desc: "Clean top-to-bottom metallic drop",
                    previewClass: "text-gradient-glass",
                    bgClass: "rgba(255, 255, 255, 0.02)"
                  },
                  {
                    title: "Brand Accent",
                    class: ".text-gradient-brand",
                    desc: "Vibrant neon-green signature",
                    previewClass: "text-gradient-brand",
                    bgClass: "rgba(190, 240, 48, 0.02)"
                  },
                  {
                    title: "Success Emerald",
                    class: ".text-gradient-success",
                    desc: "Prosperity positive balance accent",
                    previewClass: "text-gradient-success",
                    bgClass: "rgba(34, 197, 94, 0.02)"
                  },
                  {
                    title: "Warning Amber",
                    class: ".text-gradient-warning",
                    desc: "Alert caution and projected copper focus",
                    previewClass: "text-gradient-warning",
                    bgClass: "rgba(245, 158, 11, 0.02)"
                  },
                  {
                    title: "Error Crimson",
                    class: ".text-gradient-error",
                    desc: "Negative expense danger alert",
                    previewClass: "text-gradient-error",
                    bgClass: "rgba(239, 68, 68, 0.02)"
                  },
                  {
                    title: "Info Azure",
                    class: ".text-gradient-info",
                    desc: "Informational projection reference",
                    previewClass: "text-gradient-info",
                    bgClass: "rgba(59, 130, 246, 0.02)"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-neutral-800/60 bg-neutral-950/20 hover:border-neutral-700/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="token-code" style={{ fontSize: "10px", padding: "2px 6px" }}>{item.class}</span>
                      <p
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-neutral-400)",
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-lg border border-neutral-800/40 text-right min-w-[140px]"
                      style={{ backgroundColor: item.bgClass }}
                    >
                      <span
                        className={`${item.previewClass} font-semibold`}
                        style={{
                          fontFamily: "var(--font-family-body)",
                          fontSize: "var(--font-size-sm)",
                          letterSpacing: "var(--letter-spacing-tight)",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 2: Heading Levels Presets */}
            <div>
              <h4
                className="text-xs uppercase tracking-widest mb-6"
                style={{
                  color: "var(--color-neutral-400)",
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "var(--letter-spacing-widest)",
                }}
              >
                Heading Presets Cascade
              </h4>
              <div className="space-y-6">
                {[
                  {
                    level: "H1 Level Heading",
                    class: ".h1-gradient",
                    size: "3xl (1.875rem)",
                    weight: "Medium (500)",
                    preset: "h1-gradient text-gradient-glass"
                  },
                  {
                    level: "H2 Level Heading",
                    class: ".h2-gradient",
                    size: "2xl (1.5rem)",
                    weight: "Medium (500)",
                    preset: "h2-gradient text-gradient-glass"
                  },
                  {
                    level: "H3 Level Heading",
                    class: ".h3-gradient",
                    size: "xl (1.25rem)",
                    weight: "Medium (500)",
                    preset: "h3-gradient text-gradient-glass"
                  },
                  {
                    level: "H4 Level Heading",
                    class: ".h4-gradient",
                    size: "lg (1.125rem)",
                    weight: "Medium (500)",
                    preset: "h4-gradient text-gradient-glass"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={item.level}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="p-5 rounded-xl border border-neutral-800/60 bg-neutral-950/20 hover:border-neutral-700/80 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                      <span className="token-code">{item.class}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-family-mono)",
                          fontSize: "var(--font-size-2xs)",
                          color: "var(--color-neutral-500)",
                        }}
                      >
                        {item.size} · {item.weight}
                      </span>
                    </div>
                    <div className={item.preset}>
                      {item.level}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Brand-Specific Gradient Spectrum (5 Variations) */}
          <div className="mt-12 pt-8 border-t border-neutral-800/80">
            <h4
              className="text-xs uppercase tracking-widest mb-6"
              style={{
                color: "var(--color-brand-400)",
                fontFamily: "var(--font-family-mono)",
                letterSpacing: "var(--letter-spacing-widest)",
              }}
            >
              Exclusive Brand Color Gradient Spectrum (5 Variations)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  name: "Mint Light",
                  class: ".text-gradient-brand-light",
                  previewClass: "text-gradient-brand-light",
                  desc: "Ultralight pastel green",
                  tokens: "Brand 50 -> Transparent"
                },
                {
                  name: "Neon Electric",
                  class: ".text-gradient-brand-neon",
                  previewClass: "text-gradient-brand-neon",
                  desc: "High-contrast lime neon",
                  tokens: "Brand 300 -> Transparent"
                },
                {
                  name: "Active Medium",
                  class: ".text-gradient-brand-medium",
                  previewClass: "text-gradient-brand-medium",
                  desc: "Classic brand corporate",
                  tokens: "Brand 500 -> Transparent"
                },
                {
                  name: "Forest Deep",
                  class: ".text-gradient-brand-deep",
                  previewClass: "text-gradient-brand-deep",
                  desc: "Dark emerald depth",
                  tokens: "Brand 700 -> Transparent"
                },
                {
                  name: "Cosmic Dual-Tone",
                  class: ".text-gradient-brand-cosmic",
                  previewClass: "text-gradient-brand-cosmic",
                  desc: "Dynamic color transition",
                  tokens: "Brand 200 -> 600 Translucent"
                }
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-5 rounded-xl border border-neutral-850 bg-neutral-950/40 hover:border-neutral-700 transition-colors flex flex-col justify-between min-h-[170px]"
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontSize: "var(--font-size-2xs)",
                        color: "var(--color-neutral-500)",
                      }}
                      className="block mb-1"
                    >
                      {item.tokens}
                    </span>
                    <span className="token-code" style={{ fontSize: "9px", padding: "1px 4px", display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.class}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <span
                      className={`${item.previewClass} font-bold block`}
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-md)",
                        letterSpacing: "var(--letter-spacing-tight)",
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-2xs)",
                        color: "var(--color-neutral-450)",
                      }}
                      className="block"
                    >
                      {item.desc}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
