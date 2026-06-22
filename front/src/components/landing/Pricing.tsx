import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "../SectionHeader";
import { GlassCard } from "../design-system";
import { springMed, ease04, fadeUp, staggerContainer, goToAuth, viewportOnce } from "./motion";
import { ConfettiBurst } from "./Bursts";

// ─── Plan data ────────────────────────────────────────────────────────────────

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

function formatPrice(value: number | null) {
  if (value === null) return "Sob consulta";
  if (value === 0) return "R$ 0";
  return `R$ ${value}`;
}

// ─── Pricing component ────────────────────────────────────────────────────────

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [confettiPlan, setConfettiPlan] = useState<string | null>(null);

  return (
    <section
      id="pricing"
      className="py-14 px-6 md:px-12 max-w-screen-xl mx-auto"
      aria-labelledby="pricing-heading"
    >
      <SectionHeader
        index="04"
        title="Planos para cada momento"
        description="Comece grátis e evolua conforme suas finanças crescem. Sem surpresas, sem compromisso."
      />

      {/* ── Billing toggle with layoutId slide ───────────────────────── */}
      <div className="flex justify-center mb-8">
        <div
          className="relative inline-flex items-center gap-1 p-1 rounded-full border border-neutral-800"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
          role="group"
          aria-label="Período de cobrança"
        >
          {(["monthly", "annual"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setBilling(period)}
              className="relative px-5 py-1.5 rounded-full text-sm cursor-pointer z-10"
              style={{
                fontFamily: "var(--font-family-body)",
                color: billing === period
                  ? "var(--color-neutral-950)"
                  : "var(--color-neutral-500)",
              }}
              aria-pressed={billing === period}
            >
              {/* Sliding pill indicator via layoutId */}
              {billing === period && (
                <motion.div
                  layoutId="billing-indicator"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "var(--color-brand-400)" }}
                  transition={springMed}
                />
              )}
              <span className="relative z-10">{period === "monthly" ? "Mensal" : "Anual"}</span>
              {period === "annual" && (
                <span
                  className="relative z-10 ml-1.5 ds-badge ds-badge-brand"
                  style={{ fontSize: "0.55rem", padding: "0.1rem 0.35rem" }}
                >
                  -17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer()}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        style={{
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {PLANS.map((plan, i) => {
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          return (
            <motion.div
              key={plan.id}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative ${plan.recommended ? "pricing-card-pro" : ""}`}
              style={{
                transformOrigin: "center bottom"
              }}
            >
              <GlassCard
                className={`p-8 flex flex-col h-full relative ${
                  plan.recommended ? "ring-1 ring-brand-700/50" : ""
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 ds-badge ds-badge-brand animate-pulse-glow">
                    Recomendado
                  </span>
                )}

                <h3
                  id={plan.recommended ? "pricing-heading" : undefined}
                  className="ds-card-title text-xl"
                >
                  {plan.name}
                </h3>
                <p className="ds-card-subtitle mt-2 mb-6">{plan.description}</p>

                {/* Animated price crossfade */}
                <div className="mb-6 h-12 flex items-baseline">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.id}-${billing}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={ease04}
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-4xl)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--color-neutral-100)",
                      }}
                    >
                      {formatPrice(price)}
                    </motion.span>
                  </AnimatePresence>
                  {price !== null && price > 0 && (
                    <span className="ds-card-subtitle ml-1">/mês</span>
                  )}
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

                {/* CTA with confetti burst */}
                <div className="relative">
                  <ConfettiBurst trigger={confettiPlan === plan.id} />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setConfettiPlan(plan.id);
                      setTimeout(() => setConfettiPlan(null), 900);
                      goToAuth();
                    }}
                    onMouseEnter={() => plan.recommended && setConfettiPlan(plan.id)}
                    onMouseLeave={() => setConfettiPlan(null)}
                    className={`w-full py-3 rounded-2xl cursor-pointer text-sm font-medium transition-all duration-300 ${
                      plan.recommended ? "btn-tech" : "btn-tech-outline"
                    }`}
                    style={{
                      transformOrigin: "center"
                    }}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
