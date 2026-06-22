import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Quote } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { GlassCard } from "../design-system";
import Texture from "../layout/Texture";
import { springFast, viewportOnce, fadeUp, staggerContainer } from "./motion";
import { useCountUp } from "./useCountUp";

// ─── Stats data ───────────────────────────────────────────────────────────────

const STATS = [
  { value: 12000, suffix: "k+", label: "Transações analisadas" },
  { value: 2100000, suffix: " M", label: "Em projeções geradas", prefix: "R$ " },
  { value: 4.9, suffix: "/5", label: "Satisfação dos usuários", isFloat: true },
  { value: 98, suffix: "%", label: "Retenção mensal" },
];

// ─── Testimonials data ────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "Pela primeira vez sei exatamente quanto vou sobrar no fim do mês. A IA me avisou antes de estourar o orçamento de viagem.",
    author: "Marina S.",
    role: "Designer freelancer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
  },
  {
    quote: "Importei meu extrato e em minutos tinha categorias, projeções e um plano de ação. Parece ter um consultor financeiro 24h.",
    author: "Ricardo M.",
    role: "Empreendedor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80",
  },
  {
    quote: "Os alertas proativos mudaram minha relação com dinheiro. Não é só um app — é um assistente que pensa por mim.",
    author: "Ana L.",
    role: "Profissional de TI",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80",
  },
];

// ─── Stat card with proportional countUp ────────────────────────────────────

function StatCard({ stat }: { stat: typeof STATS[0] }) {
  // Duration proportional to magnitude — large numbers animate slower
  const duration = Math.log10(stat.value + 1) * 600;
  const { val, ref } = useCountUp(
    stat.isFloat ? Math.round(stat.value * 10) : stat.value,
    duration,
  );

  const displayVal = stat.isFloat
    ? (val / 10).toFixed(1)
    : stat.value >= 1_000_000
    ? (val / 1_000_000).toFixed(1)
    : stat.value >= 1_000
    ? Math.round(val / 1_000)
    : val;

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={fadeUp}
    >
      <GlassCard className="p-6 text-center">
        <p
          style={{
            fontFamily: "var(--font-family-body)",
            fontSize: "var(--font-size-3xl)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-brand-400)",
            lineHeight: "var(--line-height-none)",
          }}
        >
          {stat.prefix ?? ""}{displayVal}{stat.suffix}
        </p>
        <p className="ds-stat-label mt-2 text-xs">{stat.label}</p>
      </GlassCard>
    </motion.div>
  );
}

// ─── Drag carousel ────────────────────────────────────────────────────────────

const CARD_WIDTH = 340;
const CARD_GAP = 16;

function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((i) => Math.min(i + 1, TESTIMONIALS.length - 1));
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="relative overflow-hidden" style={{ maxWidth: CARD_WIDTH + CARD_GAP }}>
      <motion.div
        className="flex gap-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{
          left: -((CARD_WIDTH + CARD_GAP) * (TESTIMONIALS.length - 1)),
          right: 0,
        }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          const threshold = (CARD_WIDTH + CARD_GAP) * 0.3;
          if (info.offset.x < -threshold) next();
          if (info.offset.x > threshold) prev();
        }}
        animate={{ x: -currentIndex * (CARD_WIDTH + CARD_GAP) }}
        transition={springFast}
        style={{ width: TESTIMONIALS.length * (CARD_WIDTH + CARD_GAP) }}
      >
        {TESTIMONIALS.map((t) => (
          <GlassCard
            key={t.author}
            className="p-6 flex flex-col gap-4 shrink-0"
            style={{ width: CARD_WIDTH }}
          >
            <Quote size={20} style={{ color: "var(--color-brand-500)", opacity: 0.7 }} aria-hidden />
            <blockquote
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-neutral-300)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              "{t.quote}"
            </blockquote>
            <footer className="mt-auto pt-4 border-t border-neutral-800 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.author}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="ds-card-title text-sm">{t.author}</p>
                <p className="ds-card-subtitle">{t.role}</p>
              </div>
            </footer>
          </GlassCard>
        ))}
      </motion.div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: i === currentIndex
                ? "var(--color-brand-400)"
                : "var(--color-neutral-700)",
              scale: i === currentIndex ? 1.3 : 1,
            }}
            aria-label={`Ver depoimento ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SocialProof section ──────────────────────────────────────────────────────

export function SocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax coin pattern bg
  const patternY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      aria-label="Prova social"
    >
      {/* Light background + parallax coin texture */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ backgroundColor: "var(--color-neutral-50, #f8f9f7)" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ y: patternY, willChange: "transform" }}
        >
          <Texture
            color="#a8d918"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full opacity-[0.06]"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, var(--color-neutral-50, #f8f9f7) 0%, transparent 18%, transparent 82%, var(--color-neutral-50, #f8f9f7) 100%)",
          }}
        />
      </div>

      <div className="relative py-14 px-6 md:px-12 max-w-screen-xl mx-auto">
        <SectionHeader
          index="03"
          title="Confiança em números"
          description="Usuários reais, resultados reais — soberania financeira com inteligência proativa."
        />

        {/* Stats with proportional countUp */}
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>

        {/* Drag carousel — desktop: full grid, mobile: draggable */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
            >
              <GlassCard className="p-6 flex flex-col gap-4 h-full">
                <Quote size={20} style={{ color: "var(--color-brand-500)", opacity: 0.7 }} aria-hidden />
                <blockquote
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-neutral-300)",
                    lineHeight: "var(--line-height-relaxed)",
                  }}
                >
                  "{t.quote}"
                </blockquote>
                <footer className="mt-auto pt-4 border-t border-neutral-800 flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="ds-card-title text-sm">{t.author}</p>
                    <p className="ds-card-subtitle">{t.role}</p>
                  </div>
                </footer>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Mobile draggable carousel */}
        <div className="md:hidden flex justify-center">
          <TestimonialCarousel />
        </div>
      </div>
    </section>
  );
}
