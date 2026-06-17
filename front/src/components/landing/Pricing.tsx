import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "../SectionHeader";
import { GlassCard } from "../design-system";
import { fadeUp, goToAuth, staggerContainer, transition, viewportOnce } from "./motion";

type Billing = "monthly" | "annual";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    description: "Para começar a organizar suas finanças com IA.",
    features: [
      "Até 100 transações/mês",
      "Categorização automática",
      "Projeção básica mensal",
      "1 extrato importado",
    ],
    cta: "Começar grátis",
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 29,
    annual: 24,
    description: "Para quem quer controle total e insights avançados.",
    features: [
      "Transações ilimitadas",
      "Projeções avançadas 12 meses",
      "Alertas proativos IA",
      "Plano de ação personalizado",
      "Importação ilimitada",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    annual: null,
    description: "Para equipes e assessores financeiros.",
    features: [
      "Multi-workspace",
      "API & integrações",
      "Relatórios white-label",
      "SLA dedicado",
      "Onboarding personalizado",
    ],
    cta: "Falar com vendas",
    recommended: false,
  },
];

function formatPrice(value: number | null, billing: Billing) {
  if (value === null) return "Sob consulta";
  if (value === 0) return "R$ 0";
  return `R$ ${value}`;
}

export function Pricing() {
  const reducedMotion = useReducedMotion();
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto" aria-labelledby="pricing-heading">
      <SectionHeader
        index="04"
        title="Planos para cada momento"
        description="Comece grátis e evolua conforme suas finanças crescem. Sem surpresas, sem compromisso."
      />

      <div className="flex justify-center mb-10">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-2xl border border-neutral-800"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
          role="group"
          aria-label="Período de cobrança"
        >
          {(["monthly", "annual"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setBilling(period)}
              className="relative px-5 py-2 rounded-xl text-sm cursor-pointer transition-colors"
              style={{
                fontFamily: "var(--font-family-body)",
                color: billing === period ? "var(--color-brand-400)" : "var(--color-neutral-500)",
                backgroundColor: billing === period ? "rgba(190, 240, 48, 0.08)" : "transparent",
                border: billing === period ? "1px solid var(--color-brand-800)" : "1px solid transparent",
              }}
              aria-pressed={billing === period}
            >
              {period === "monthly" ? "Mensal" : "Anual"}
              {period === "annual" && (
                <span
                  className="ml-1.5 ds-badge ds-badge-brand"
                  style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}
                >
                  -17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
      >
        {PLANS.map((plan, i) => {
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          return (
            <GlassCard
              key={plan.id}
              className={`p-8 flex flex-col h-full relative ${
                plan.recommended ? "ring-1 ring-brand-700/50" : ""
              }`}
              motionProps={{
                variants: fadeUp,
                transition: transition(0.5, i * 0.1, reducedMotion),
                whileHover: reducedMotion ? undefined : { scale: 1.02, y: -4 },
              }}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 ds-badge ds-badge-brand animate-pulse-glow">
                  Recomendado
                </span>
              )}

              <h3 id={plan.recommended ? "pricing-heading" : undefined} className="ds-card-title text-xl">
                {plan.name}
              </h3>
              <p className="ds-card-subtitle mt-2 mb-6">{plan.description}</p>

              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${plan.id}-${billing}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={transition(0.25, 0, reducedMotion)}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-4xl)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--color-neutral-100)",
                      }}
                    >
                      {formatPrice(price, billing)}
                    </span>
                    {price !== null && price > 0 && (
                      <span className="ds-card-subtitle ml-1">/mês</span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: "var(--color-brand-400)" }}
                      aria-hidden
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-neutral-400)",
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                type="button"
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                onClick={goToAuth}
                className={`w-full py-3 rounded-2xl cursor-pointer text-sm font-medium ${
                  plan.recommended ? "btn-tech" : "btn-tech-outline"
                }`}
              >
                {plan.cta}
              </motion.button>
            </GlassCard>
          );
        })}
      </motion.div>
    </section>
  );
}
