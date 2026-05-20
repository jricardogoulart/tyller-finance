import { motion, useAnimation } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

const durations = Object.entries(tokens.primitive.duration);
const easings = [
  { key: "default",  label: "default",  curve: [0.165, 0.84, 0.44, 1],  css: "cubic-bezier(0.165,0.84,0.44,1)" },
  { key: "easeIn",   label: "easeIn",   curve: [0.76, 0.09, 0.215, 1],  css: "cubic-bezier(0.76,0.09,0.215,1)" },
  { key: "easeOut",  label: "easeOut",  curve: [0.165, 0.84, 0.44, 1],  css: "cubic-bezier(0.165,0.84,0.44,1)" },
  { key: "spring",   label: "spring",   curve: [0.34, 1.56, 0.64, 1],   css: "cubic-bezier(0.34,1.56,0.64,1)" },
  { key: "snappy",   label: "snappy",   curve: [0.4, 0, 0.2, 1],         css: "cubic-bezier(0.4,0,0.2,1)" },
];

const gsapEasings = Object.entries(tokens.primitive.easing.gsap);

function DurationDemo({ label, value, delay }: { label: string; value: string; delay: number }) {
  const [playing, setPlaying] = useState(false);
  const controls = useAnimation();

  const play = async () => {
    if (playing) return;
    setPlaying(true);
    await controls.start({ x: "calc(100% - 2.5rem)", transition: { duration: parseFloat(value) / 1000, ease: [0.165, 0.84, 0.44, 1] } });
    await controls.start({ x: 0, transition: { duration: parseFloat(value) / 1000, ease: [0.165, 0.84, 0.44, 1] } });
    setPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.165, 0.84, 0.44, 1] }}
      className="flex items-center gap-4 py-3 border-b border-neutral-800/50 group"
    >
      <div className="w-24 shrink-0">
        <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-400)" }}>
          {label}
        </span>
      </div>
      <div className="w-16 shrink-0">
        <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-400)" }}>
          {value}
        </span>
      </div>
      {/* Track */}
      <button
        onClick={play}
        className="flex-1 relative h-8 rounded-full overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-neutral-800)" }}
        title="Play animation"
      >
        <motion.div
          animate={controls}
          initial={{ x: 0 }}
          className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: "var(--color-brand-400)" }}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-2xs"
          style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-500)" }}
        >
          click to play
        </span>
      </button>
    </motion.div>
  );
}

function EasingCard({ easing, delay }: { easing: typeof easings[0]; delay: number }) {
  const [playing, setPlaying] = useState(false);
  const controls = useAnimation();
  const [x1, y1, x2, y2] = easing.curve as [number, number, number, number];

  const play = async () => {
    if (playing) return;
    setPlaying(true);
    await controls.start({
      y: -48,
      transition: { duration: 0.7, ease: [x1, y1, x2, y2] }
    });
    await controls.start({
      y: 0,
      transition: { duration: 0.7, ease: [x1, y1, x2, y2] }
    });
    setPlaying(false);
  };

  // SVG bezier curve path
  const svgW = 80, svgH = 80;
  const cx1 = x1 * svgW, cy1 = svgH - y1 * svgH;
  const cx2 = x2 * svgW, cy2 = svgH - y2 * svgH;
  const curvePath = `M 0 ${svgH} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${svgW} 0`;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.165, 0.84, 0.44, 1] }}
      whileHover={{ borderColor: "var(--color-brand-700)" }}
      onClick={play}
      className="relative rounded-2xl border border-neutral-800 p-5 text-left cursor-pointer overflow-hidden group transition-colors"
      style={{ backgroundColor: "var(--color-neutral-900)" }}
    >
      {/* Bezier curve SVG */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <div style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-400)" }}>
            {easing.key}
          </div>
          <div style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)", marginTop: "0.25rem" }}>
            {easing.css}
          </div>
        </div>
        <svg width={80} height={80} viewBox={`0 0 ${svgW} ${svgH}`} className="opacity-60 group-hover:opacity-100 transition-opacity">
          <line x1="0" y1={svgH} x2={cx1} y2={cy1} stroke="var(--color-neutral-700)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={svgW} y1="0" x2={cx2} y2={cy2} stroke="var(--color-neutral-700)" strokeWidth="1" strokeDasharray="3,3" />
          <path d={curvePath} fill="none" stroke="var(--color-brand-400)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx1} cy={cy1} r="3" fill="var(--color-brand-600)" />
          <circle cx={cx2} cy={cy2} r="3" fill="var(--color-brand-600)" />
          <circle cx="0" cy={svgH} r="3" fill="var(--color-neutral-400)" />
          <circle cx={svgW} cy="0" r="3" fill="var(--color-neutral-400)" />
        </svg>
      </div>

      {/* Ball */}
      <div className="relative h-16 flex items-end">
        <div className="w-full h-px" style={{ backgroundColor: "var(--color-neutral-800)" }} />
        <motion.div
          animate={controls}
          initial={{ y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-7 h-7 rounded-full shadow-lg"
          style={{
            backgroundColor: "var(--color-brand-400)",
            boxShadow: "var(--shadow-glow)",
          }}
        />
      </div>

      <div className="mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-600)", fontSize: "var(--font-size-2xs)" }}>
        Click to animate ↑
      </div>
    </motion.button>
  );
}

export function MotionSection() {
  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="04"
        title="Motion & Animation"
        description="Durations, easing curves, and GSAP tokens — the kinetic vocabulary of the design system. Click each card to preview."
      />

      {/* Duration */}
      <div
        className="rounded-2xl border border-neutral-800 p-6 mb-12"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        <h3 className="text-xs uppercase tracking-widest mb-6"
          style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
          Duration Scale — click tracks to preview
        </h3>
        {durations.map(([key, token], i) => (
          <DurationDemo key={key} label={key} value={token.$value} delay={i * 0.04} />
        ))}
      </div>

      {/* CSS Easings */}
      <div className="mb-12">
        <h3 className="text-xs uppercase tracking-widest mb-6"
          style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
          CSS Easing Curves — click to animate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {easings.map((e, i) => (
            <EasingCard key={e.key} easing={e} delay={i * 0.06} />
          ))}
        </div>
      </div>

      {/* GSAP Easings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-neutral-800 p-6"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        <h3 className="text-xs uppercase tracking-widest mb-6"
          style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
          GSAP Easing Strings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gsapEasings.map(([key, token], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-800 group hover:border-brand-800 transition-colors"
              style={{ backgroundColor: "var(--color-neutral-850)" }}
            >
              <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-300)" }}>
                gsap.{key}
              </span>
              <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-brand-500)" }}>
                {token.$value}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
