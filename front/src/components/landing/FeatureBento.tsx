import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CircleHelp,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import {
  bentoGrid,
  fadeUp,
  scaleIn,
  hoverGlow,
  pushNotif,
  shakeVariant,
  viewportOnce,
  scrollToSection,
} from "./motion";
import { useCountUp } from "./useCountUp";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeatureItem = {
  id: string;
  order: string;
  title: string;
  description: ReactNode;
  Icon: LucideIcon;
  iconClass?: string;
  metric?: string;
};

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURED_BULLETS = [
  "Detecta cobranças duplicadas em segundos",
  "Avisa sobre assinaturas esquecidas antes do vencimento",
] as const;

const FEATURES: FeatureItem[] = [
  {
    id: "upload",
    order: "02",
    title: "Importe seus dados instantaneamente",
    description: (
      <>
        Envie seus extratos via <strong>PDF, OFX ou conexão bancária segura</strong> e deixe nossa IA
        organizar seus gastos por categoria em poucos segundos.
      </>
    ),
    Icon: ArrowLeftRight,
    iconClass: "icon-sync",
  },
  {
    id: "alerts",
    order: "03",
    title: "Receba alertas em tempo real",
    description: (
      <>
        <strong>Notificações instantâneas</strong> direto no seu WhatsApp ou celular sempre que você
        gastar mais do que o planejado.
      </>
    ),
    Icon: Bell,
    iconClass: "icon-bell-animate",
  },
  {
    id: "goals",
    order: "04",
    title: "Orçamentos inteligentes",
    description: (
      <>
        Crie planejamentos financeiros saudáveis que ajudam você a poupar para o que realmente importa,
        com acompanhamento imediato.
      </>
    ),
    Icon: Target,
    metric: "Economize até 20%",
  },
  {
    id: "projections",
    order: "05",
    title: "Preveja seu saldo futuro",
    description: (
      <>
        Veja quanto vai sobrar no fim do mês com <strong>cálculos automáticos baseados no seu histórico</strong>,
        de forma imediata.
      </>
    ),
    Icon: LineChart,
    iconClass: "icon-chart-animate",
  },
];

const ICON_STROKE = 2.25;

// ─── Proactive notification with push + shake ─────────────────────────────────

function FeatureNotificationPreview() {
  const [showNotif, setShowNotif] = useState(false);

  // Auto-toggle notification every 3s for demo
  useEffect(() => {
    const id = setTimeout(() => setShowNotif(true), 800);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showNotif) return;
    const id = setTimeout(() => setShowNotif(false), 3200);
    return () => clearTimeout(id);
  }, [showNotif]);

  return (
    <div className="relative mt-4 h-[72px]" aria-hidden="true">
      <AnimatePresence>
        {showNotif && (
          <motion.div
            variants={pushNotif}
            initial="hidden"
            animate={["visible", "shake"]}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
            className="feature-notification"
          >
            <div className="feature-notification__header">
              <Sparkles size={14} strokeWidth={ICON_STROKE} className="feature-notification__icon" />
              <span className="feature-notification__label">Tyller IA</span>
              <span className="feature-notification__time">agora</span>
            </div>
            <p className="feature-notification__title">Assinatura duplicada detectada</p>
            <p className="feature-notification__body">
              Netflix cobrou 2x este mês — toque para resolver com um clique
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CountUp card for "projections" feature ───────────────────────────────────

function ProjectionCountCard() {
  const { val, ref } = useCountUp(2340, 1500);

  return (
    <div ref={ref} className="mt-3 flex items-baseline gap-1">
      <span
        className="font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-family-body)",
          fontSize: "var(--font-size-2xl)",
          color: "var(--color-brand-400)",
        }}
      >
        +R$ {val.toLocaleString("pt-BR")}
      </span>
      <span
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-2xs)",
          color: "var(--color-neutral-500)",
        }}
      >
        sobra projetada
      </span>
    </div>
  );
}

// ─── Feature cards ────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const { Icon } = feature;

  return (
    <motion.li
      variants={fadeUp}
      className="h-full min-h-[220px]"
      {...hoverGlow}
    >
      <article
        className="feature-card group h-full"
        tabIndex={0}
        role="button"
        aria-label={`${feature.title}. Saiba mais sobre este recurso.`}
        onClick={() => scrollToSection("how-it-works")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollToSection("how-it-works");
          }
        }}
      >
        <span className="feature-card__number" aria-hidden="true">
          {feature.order}
        </span>
        <ArrowUpRight size={16} strokeWidth={ICON_STROKE} className="feature-card__arrow" aria-hidden="true" />

        <div className={`feature-card__icon-wrap ${feature.iconClass ?? ""}`}>
          <Icon size={20} strokeWidth={ICON_STROKE} className="feature-card__icon" aria-hidden="true" />
          <span className="sr-only">{feature.title}</span>
        </div>

        <h3 className="feature-card__title">{feature.title}</h3>
        <p className="feature-card__desc">{feature.description}</p>

        {/* CountUp inside projections card */}
        {feature.id === "projections" && <ProjectionCountCard />}
        {feature.metric && feature.id !== "projections" && (
          <p className="feature-card__metric">{feature.metric}</p>
        )}
      </article>
    </motion.li>
  );
}

// ─── FeatureBento ─────────────────────────────────────────────────────────────

export function FeatureBento() {
  return (
    <section
      id="features"
      className="features-section"
      aria-labelledby="features-section-title"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="features-section__ambient" aria-hidden="true">
        <div className="features-section__ambient-glow" />
        <div className="features-section__grid-bg" />
      </div>

      <div className="features-section__progress-rail" aria-hidden="true" />

      <div className="features-section__container">
        <div id="features-section-title">
          <SectionHeader
            variant="features"
            index="01"
            title="A engenharia inteligente que assume o controle das suas finanças"
            description={
              <>
                Ferramentas práticas para automatizar seus gastos, prever o saldo do mês e investir sem
                dúvidas,{" "}
                <span className="section-header__highlight">potencializado por IA</span>.
              </>
            }
            socialProof="Recursos validados por mais de 15.000 investidores"
          />
        </div>

        {/* Stagger bento grid */}
        <motion.div
          variants={bentoGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="features-bento"
        >
          {/* Featured card — IA Proativa */}
          <motion.article
            variants={scaleIn}
            className="feature-card feature-card--featured group"
            tabIndex={0}
            role="button"
            aria-label="IA Proativa. Saiba mais sobre este recurso exclusivo."
            onClick={() => scrollToSection("how-it-works")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                scrollToSection("how-it-works");
              }
            }}
            whileHover={{
              scale: 1.02,
              y: -4,
              boxShadow: "0 0 0 1px #bef030, 0 8px 32px rgba(190,240,48,0.18)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="feature-card__number" aria-hidden="true">01</span>
            <ArrowUpRight size={16} strokeWidth={ICON_STROKE} className="feature-card__arrow" aria-hidden="true" />

            <span className="feature-card__badge">Exclusivo</span>

            <div className="feature-card__title-row">
              <div className="feature-card__icon-wrap">
                <Sparkles size={22} strokeWidth={ICON_STROKE} className="feature-card__icon" aria-hidden="true" />
              </div>
              <button
                type="button"
                className="feature-card__help"
                aria-label="O que é IA Proativa? A IA avisa se uma assinatura subir de preço ou se detectar cobranças duplicadas."
                title="Exemplo: a IA avisa se uma assinatura subir de preço ou se detectar cobranças duplicadas."
                onClick={(e) => e.stopPropagation()}
              >
                <CircleHelp size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              </button>
            </div>

            <h3 className="feature-card__title feature-card__title--featured">IA Proativa</h3>
            <p className="feature-card__desc">
              Proteja seu fluxo de caixa e receba rotas de melhoria: nossa inteligência avisa sobre{" "}
              <strong>cobranças duplicadas ou assinaturas esquecidas</strong> antes do vencimento.
            </p>

            <ul className="feature-checklist">
              {FEATURED_BULLETS.map((item) => (
                <li key={item}>
                  <span className="feature-checklist__mark" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Push notification with shake */}
            <FeatureNotificationPreview />
          </motion.article>

          {/* Staggered feature grid */}
          <ul className="features-grid" aria-label="Recursos da plataforma">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="features-section__cta-wrap"
        >
          <button
            type="button"
            className="features-cta"
            onClick={() => scrollToSection("how-it-works")}
          >
            Conhecer todos os recursos da plataforma
            <ArrowRight size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
