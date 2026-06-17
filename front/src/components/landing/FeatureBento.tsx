import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Brain,
  LineChart,
  Shield,
  Target,
  Upload,
  Zap,
} from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { GlassCard } from "../design-system";
import { fadeUp, scaleIn, staggerContainer, transition, viewportOnce } from "./motion";

const FEATURES = [
  {
    id: "ai",
    title: "IA Proativa",
    description:
      "Antecipa problemas financeiros e sugere ações antes que você precise se preocupar.",
    Icon: Brain,
    span: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    id: "upload",
    title: "Importação Inteligente",
    description: "Envie extratos e deixe a IA categorizar automaticamente.",
    Icon: Upload,
    span: "",
  },
  {
    id: "projections",
    title: "Projeções Precisas",
    description: "Veja quanto vai sobrar no fim do mês com modelos preditivos.",
    Icon: LineChart,
    span: "",
  },
  {
    id: "alerts",
    title: "Alertas em Tempo Real",
    description: "Notificações quando gastos fogem do padrão.",
    Icon: Bell,
    span: "",
  },
  {
    id: "goals",
    title: "Metas & Orçamentos",
    description: "Defina limites por categoria e acompanhe o progresso.",
    Icon: Target,
    span: "",
  },
  {
    id: "insights",
    title: "Insights Visuais",
    description: "Gráficos e rankings que revelam padrões ocultos nos seus gastos.",
    Icon: BarChart3,
    span: "lg:col-span-2",
  },
  {
    id: "security",
    title: "Segurança LGPD",
    description: "Seus dados financeiros protegidos com criptografia e conformidade.",
    Icon: Shield,
    span: "",
  },
  {
    id: "speed",
    title: "Respostas Instantâneas",
    description: "Análises e relatórios gerados em segundos, não em horas.",
    Icon: Zap,
    span: "",
  },
];

export function FeatureBento() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="features" className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto" aria-labelledby="features-section-title">
      <div id="features-section-title">
        <SectionHeader
        index="01"
        title="Recursos que transformam suas finanças"
        description="Tudo que você precisa para ter clareza, controle e convicção sobre seu dinheiro — potencializado por IA."
      />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr"
      >
        {FEATURES.map((feature, i) => (
          <GlassCard
            key={feature.id}
            className={`p-6 h-full group ${feature.span}`}
            motionProps={{
              variants: feature.featured ? scaleIn : fadeUp,
              transition: transition(0.45, i * 0.05, reducedMotion),
              whileHover: reducedMotion ? undefined : { y: -4, scale: 1.01 },
            }}
          >
            <div className="flex flex-col h-full gap-4">
              <div className="ds-icon-tile w-fit">
                <feature.Icon size={feature.featured ? 22 : 18} aria-hidden />
              </div>
              <div>
                <h3
                  className="ds-card-title mb-2"
                  style={{ fontSize: feature.featured ? "var(--font-size-xl)" : undefined }}
                >
                  {feature.title}
                </h3>
                <p className="ds-card-subtitle" style={{ lineHeight: "var(--line-height-relaxed)" }}>
                  {feature.description}
                </p>
              </div>
              {feature.featured && (
                <div className="mt-auto pt-4 border-t border-neutral-800">
                  <span className="ds-badge ds-badge-brand">Destaque</span>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </section>
  );
}
