import { motion } from "framer-motion";
import { Link2, LineChart, Sparkles, ArrowRight } from "lucide-react";
import { staggerContainer, fadeUp, viewportOnce, goToAuth } from "./motion";

// ─── Step data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    label: "CONECTE",
    title: "Importe em segundos",
    description:
      "Conecte sua conta bancária ou envie um extrato. Nossa IA categoriza cada transação automaticamente.",
    Icon: Link2,
    accent: "var(--color-brand-400)",
    mock: <StepMockConnect />,
  },
  {
    num: "02",
    label: "ANALISE",
    title: "IA mapeia seus hábitos",
    description:
      "Detectamos assinaturas esquecidas, gastos recorrentes e padrões ocultos no seu orçamento.",
    Icon: Sparkles,
    accent: "var(--color-brand-300)",
    mock: <StepMockAnalyze />,
  },
  {
    num: "03",
    label: "DECIDA",
    title: "Preveja e economize",
    description:
      "Saiba quanto vai sobrar no fim do mês e receba planos práticos para acelerar seus objetivos.",
    Icon: LineChart,
    accent: "var(--color-brand-400)",
    mock: <StepMockResult />,
  },
];

// ─── Inline mocks — one per step ─────────────────────────────────────────────

function StepMockConnect() {
  return (
    <div className="hiw-mock">
      <div className="hiw-mock-row">
        <span className="hiw-mock-dot" style={{ background: "var(--color-brand-400)" }} />
        <span className="hiw-mock-label">Nubank · extrato</span>
        <span className="hiw-mock-tag hiw-mock-tag-ok">OK</span>
      </div>
      <div className="hiw-mock-row">
        <span className="hiw-mock-dot" style={{ background: "var(--color-neutral-600)" }} />
        <span className="hiw-mock-label">Bradesco · OFX</span>
        <span className="hiw-mock-tag hiw-mock-tag-ok">OK</span>
      </div>
      <div className="hiw-mock-divider" />
      <div className="hiw-mock-stat">
        <span className="hiw-mock-stat-val">143</span>
        <span className="hiw-mock-stat-lbl">transações importadas</span>
      </div>
    </div>
  );
}

function StepMockAnalyze() {
  const bars = [
    { label: "Alimentação", pct: 68, color: "var(--color-brand-400)" },
    { label: "Assinaturas", pct: 42, color: "var(--color-warning-500)" },
    { label: "Transporte", pct: 28, color: "var(--color-neutral-500)" },
  ];
  return (
    <div className="hiw-mock">
      {bars.map((b) => (
        <div key={b.label} className="hiw-mock-bar-row">
          <span className="hiw-mock-bar-label">{b.label}</span>
          <div className="hiw-mock-bar-track">
            <motion.div
              className="hiw-mock-bar-fill"
              style={{ background: b.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${b.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
      <div className="hiw-mock-divider" />
      <div className="hiw-mock-alert">
        <Sparkles size={11} style={{ color: "var(--color-warning-500)" }} />
        <span>2 assinaturas duplicadas detectadas</span>
      </div>
    </div>
  );
}

function StepMockResult() {
  return (
    <div className="hiw-mock">
      <div className="hiw-mock-forecast">
        <span className="hiw-mock-forecast-label">Saldo projetado — julho</span>
        <span className="hiw-mock-forecast-val">+R$ 2.340</span>
      </div>
      <div className="hiw-mock-sparkline" aria-hidden>
        <svg viewBox="0 0 120 32" fill="none" className="w-full h-full">
          <motion.path
            d="M0 26 Q 18 8, 36 18 T 72 10 T 120 14"
            stroke="var(--color-brand-400)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.circle
            cx="120" cy="14" r="3"
            fill="var(--color-brand-400)"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.1 }}
          />
        </svg>
      </div>
      <div className="hiw-mock-divider" />
      <div className="hiw-mock-alert" style={{ color: "var(--color-brand-400)" }}>
        <LineChart size={11} />
        <span>Economize R$ 380 cortando assinaturas</span>
      </div>
    </div>
  );
}

// ─── HowItWorksTimeline ───────────────────────────────────────────────────────

export function HowItWorksTimeline() {
  return (
    <section
      id="how-it-works"
      className="hiw-section"
      aria-labelledby="how-it-works-heading"
    >
      <div className="hiw-glow" aria-hidden />

      <div className="hiw-inner">
        {/* Header */}
        <motion.header
          className="hiw-header"
          variants={staggerContainer(0.1, 0)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className="hiw-eyebrow">
            PROCESSO AUTOMATIZADO
          </motion.span>
          <motion.h2 variants={fadeUp} id="how-it-works-heading" className="hiw-title">
            Seu controle financeiro{" "}
            <span className="hiw-title-accent">em minutos</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="hiw-subtitle">
            3 passos simples para organizar seus gastos e projetar seu patrimônio,
            sem esforço e sem custos.
          </motion.p>
        </motion.header>

        {/* Steps grid */}
        <motion.div
          className="hiw-grid"
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="hiw-card"
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            >
              {/* Step number — large background watermark */}
              <span className="hiw-card-num" aria-hidden>{step.num}</span>

              {/* Top row: icon + label */}
              <div className="hiw-card-top">
                <div className="hiw-icon-wrap">
                  <step.Icon size={18} strokeWidth={2} aria-hidden />
                </div>
                <span className="hiw-card-label">{step.label}</span>
              </div>

              {/* Mock visual */}
              <div className="hiw-card-mock">
                {step.mock}
              </div>

              {/* Text */}
              <div className="hiw-card-body">
                <h3 className="hiw-card-title">{step.title}</h3>
                <p className="hiw-card-desc">{step.description}</p>
              </div>

              {/* Connector arrow (not on last card) */}
              {i < STEPS.length - 1 && (
                <span className="hiw-connector" aria-hidden>
                  <ArrowRight size={16} />
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="hiw-cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            type="button"
            onClick={goToAuth}
            className="btn-tech px-8 py-3 rounded-2xl cursor-pointer text-sm"
          >
            Começar meu teste gratuito
            <span aria-hidden className="ml-2">&rarr;</span>
          </button>
          <p className="hiw-cta-sub">
            Sem cartão de crédito · menos de 2 minutos
          </p>
        </motion.div>
      </div>
    </section>
  );
}
