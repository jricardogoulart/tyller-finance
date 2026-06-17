import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { GlassCard } from "../design-system";
import { fadeUp, staggerContainer, transition, viewportOnce } from "./motion";

const STATS = [
  { value: "12k+", label: "Transações analisadas" },
  { value: "R$ 2.1M", label: "Em projeções geradas" },
  { value: "4.9/5", label: "Satisfação dos usuários" },
  { value: "98%", label: "Retenção mensal" },
];

const TESTIMONIALS = [
  {
    quote:
      "Pela primeira vez sei exatamente quanto vou sobrar no fim do mês. A IA me avisou antes de estourar o orçamento de viagem.",
    author: "Marina S.",
    role: "Designer freelancer",
  },
  {
    quote:
      "Importei meu extrato e em minutos tinha categorias, projeções e um plano de ação. Parece ter um consultor financeiro 24h.",
    author: "Ricardo M.",
    role: "Empreendedor",
  },
  {
    quote:
      "Os alertas proativos mudaram minha relação com dinheiro. Não é só um app — é um assistente que pensa por mim.",
    author: "Ana L.",
    role: "Profissional de TI",
  },
];

export function SocialProof() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto" aria-label="Prova social">
      <SectionHeader
        index="03"
        title="Confiança em números"
        description="Usuários reais, resultados reais — soberania financeira com inteligência proativa."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
      >
        {STATS.map((stat, i) => (
          <GlassCard
            key={stat.label}
            className="p-6 text-center"
            motionProps={{
              variants: fadeUp,
              transition: transition(0.4, i * 0.06, reducedMotion),
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-3xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-brand-400)",
                lineHeight: "var(--line-height-none)",
              }}
            >
              {stat.value}
            </p>
            <p className="ds-stat-label mt-2 text-xs">{stat.label}</p>
          </GlassCard>
        ))}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {TESTIMONIALS.map((t, i) => (
          <GlassCard
            key={t.author}
            className="p-6 flex flex-col gap-4"
            motionProps={{
              variants: fadeUp,
              transition: transition(0.45, i * 0.08, reducedMotion),
              whileHover: reducedMotion ? undefined : { y: -3 },
            }}
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
            <footer className="mt-auto pt-4 border-t border-neutral-800">
              <p className="ds-card-title text-sm">{t.author}</p>
              <p className="ds-card-subtitle">{t.role}</p>
            </footer>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
