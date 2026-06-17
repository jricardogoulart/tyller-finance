import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { GlassCard } from "../design-system";
import { HeroMascotScene } from "./HeroMascotScene";
import { fadeUp, goToAuth, staggerContainer, transition } from "./motion";

export function LandingHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-14"
      aria-labelledby="landing-hero-title"
    >
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Copy column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            <motion.div variants={fadeUp} transition={transition(0.5, 0.1, reducedMotion)} className="flex items-center gap-3 mb-6">
              <span className="ds-badge ds-badge-brand">◆ Assistente de IA</span>
              <div className="h-px w-10" style={{ backgroundColor: "var(--color-neutral-800)" }} />
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-neutral-600)",
                }}
              >
                Finanças pessoais proativas
              </span>
            </motion.div>

            <motion.div variants={fadeUp} transition={transition(0.7, 0.15, reducedMotion)} className="animate-float-slow relative">
              <div
                className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-glow-lime blur-[100px] opacity-20 pointer-events-none"
                style={{ mixBlendMode: "screen" }}
                aria-hidden
              />
              <h1
                id="landing-hero-title"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "var(--line-height-tight)",
                  letterSpacing: "var(--letter-spacing-tighter)",
                }}
              >
                <span className="text-gradient-hero-loop">Tyller Finance</span>
                <br />
                <span className="text-gradient-brand-loop">Seu assistente</span>
                <span style={{ color: "var(--color-neutral-200)" }}> de IA para finanças</span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={transition(0.6, 0.3, reducedMotion)}
              className="mt-6 max-w-lg"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-lg)",
                color: "var(--color-neutral-400)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Saiba exatamente quanto vai sobrar no fim do mês. A IA analisa seus gastos,
              projeta seu futuro financeiro e sugere ações concretas — antes que o problema apareça.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={transition(0.5, 0.45, reducedMotion)}
              className="flex flex-wrap gap-8 mt-10"
            >
              {[
                { num: "94%", label: "Precisão nas projeções" },
                { num: "3min", label: "Para começar" },
                { num: "24/7", label: "Monitoramento IA" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-2xl)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--color-brand-400)",
                      lineHeight: "var(--line-height-none)",
                    }}
                  >
                    {stat.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-neutral-500)",
                      letterSpacing: "var(--letter-spacing-wide)",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={transition(0.5, 0.55, reducedMotion)}
              className="flex flex-wrap gap-3 mt-10"
            >
              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={goToAuth}
                className="btn-tech flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer text-sm"
              >
                Começar gratuitamente
                <ArrowRight size={16} aria-hidden />
              </motion.button>
              <motion.button
                type="button"
                whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-tech-outline flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer text-sm"
              >
                Ver como funciona
              </motion.button>
            </motion.div>
          </motion.div>

          {/* 3D mascot + coins scene */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition(0.8, 0.35, reducedMotion)}
            className="relative flex flex-col items-center lg:items-end"
          >
            <HeroMascotScene />

            <p
              className="sr-only"
            >
              Mascote Tyller em render 3D metálico com moedas orbitando ao redor
            </p>

            <GlassCard
              className="absolute -left-1 md:left-0 top-6 p-3.5 max-w-[190px] hidden sm:block z-30"
              motionProps={{
                initial: { opacity: 0, x: -12 },
                animate: { opacity: 1, x: 0 },
                transition: transition(0.55, 0.75, reducedMotion),
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="ds-icon-tile shrink-0 w-9 h-9">
                  <TrendingUp size={16} aria-hidden />
                </div>
                <div>
                  <p className="ds-stat-value-brand text-sm">+R$ 2.340</p>
                  <p className="ds-card-subtitle text-2xs">Sobra projetada</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="absolute -right-1 md:right-2 bottom-8 p-3.5 max-w-[190px] z-30"
              motionProps={{
                initial: { opacity: 0, x: 12 },
                animate: { opacity: 1, x: 0 },
                transition: transition(0.55, 0.9, reducedMotion),
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="ds-icon-tile shrink-0 w-9 h-9">
                  <Sparkles size={16} aria-hidden />
                </div>
                <div>
                  <p className="ds-stat-value text-sm">IA Proativa</p>
                  <p className="ds-card-subtitle text-2xs">3 alertas esta semana</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
