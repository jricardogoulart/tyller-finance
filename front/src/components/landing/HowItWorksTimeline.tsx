import { motion, useReducedMotion } from "framer-motion";
import { FileUp, LineChart, Sparkles } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { fadeUp, goToAuth, staggerContainer, transition, viewportOnce } from "./motion";

const STEPS = [
  {
    num: "01",
    title: "Conecte seus dados",
    description:
      "Importe extratos bancários ou registre transações manualmente. A IA organiza tudo automaticamente.",
    Icon: FileUp,
  },
  {
    num: "02",
    title: "A IA analisa padrões",
    description:
      "Identificamos recorrências, categorias e tendências — revelando onde seu dinheiro realmente vai.",
    Icon: Sparkles,
  },
  {
    num: "03",
    title: "Projeções & ações",
    description:
      "Receba projeções mensais, alertas proativos e um plano de ação personalizado para otimizar seus gastos.",
    Icon: LineChart,
  },
];

export function HowItWorksTimeline() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto"
      aria-labelledby="how-it-works-heading"
    >
      <SectionHeader
        index="02"
        title="Como funciona"
        description="Três passos simples para transformar caos financeiro em clareza e convicção."
      />

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative space-y-8 pl-8 md:pl-10"
      >
        <div className="ds-timeline-line" aria-hidden />

        {STEPS.map((step, i) => (
          <motion.li
            key={step.num}
            variants={fadeUp}
            transition={transition(0.5, i * 0.12, reducedMotion)}
            className="relative"
          >
            <div className="ds-timeline-dot" aria-hidden />
            <article className="ds-timeline-card">
              <div className="ds-timeline-card-header cursor-default">
                <div className="flex items-start gap-4">
                  <div className="ds-icon-tile shrink-0">
                    <step.Icon size={18} aria-hidden />
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        fontSize: "var(--font-size-2xs)",
                        color: "var(--color-brand-500)",
                        letterSpacing: "var(--letter-spacing-widest)",
                      }}
                    >
                      PASSO {step.num}
                    </span>
                    <h3
                      id={i === 0 ? "how-it-works-heading" : undefined}
                      className="ds-card-title mt-1"
                    >
                      {step.title}
                    </h3>
                    <p className="ds-card-subtitle mt-2 max-w-xl" style={{ lineHeight: "var(--line-height-relaxed)" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </motion.li>
        ))}
      </motion.ol>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={transition(0.5, 0.2, reducedMotion)}
        className="mt-12 text-center"
      >
        <button type="button" onClick={goToAuth} className="btn-tech px-8 py-3 rounded-2xl cursor-pointer text-sm">
          Experimentar agora — é grátis
        </button>
      </motion.div>
    </section>
  );
}
