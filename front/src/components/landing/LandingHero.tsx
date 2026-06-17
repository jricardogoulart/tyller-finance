import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { GlassCard } from "../design-system";
import { HeroMascotScene } from "./HeroMascotScene";
import { fadeUp, goToAuth, staggerContainer, transition } from "./motion";

function TypingWord() {
  const words = ["gastos", "futuro", "orçamento", "saldo"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, reverse, index]);

  return (
    <span className="text-gradient-brand-loop font-semibold">
      {words[index].substring(0, subIndex)}
      <span className={blink ? "opacity-100" : "opacity-0"} style={{ color: "var(--color-brand-400)" }}>|</span>
    </span>
  );
}

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
              <span className="ds-badge ds-badge-brand rounded-[4px]">◆ Assistente de IA</span>
              <div className="h-px w-10" style={{ backgroundColor: "var(--color-neutral-800)" }} />
              <span
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-neutral-300)",
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
                <span style={{ color: "var(--color-neutral-100)" }}>Tyller </span>
                <span style={{ color: "var(--color-brand-400)" }}>Finance</span>
                <br />
                <span style={{ color: "var(--color-neutral-200)" }}>A IA que antecipa seu </span>
                <TypingWord />
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
              Saiba exatamente quanto vai sobrar no fim do mês. Evite surpresas no orçamento com alertas automáticos e previsões em tempo real da nossa inteligência artificial.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={transition(0.5, 0.45, reducedMotion)}
              className="grid grid-cols-3 gap-6 w-full max-w-md mt-10"
            >
              {[
                { num: "94%*", label: "Precisão nas projeções" },
                { num: "< 3 min", label: "Configuração rápida" },
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
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-300)",
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

            <motion.div
              variants={fadeUp}
              transition={transition(0.5, 0.6, reducedMotion)}
              className="text-2xs text-neutral-500 mt-3 flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-brand-400" /> Sem necessidade de cartão de crédito</span>
              <span className="hidden sm:inline">•</span>
              <span>Segurança nível bancário com criptografia de ponta a ponta</span>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={transition(0.5, 0.65, reducedMotion)}
              className="text-[10px] text-neutral-600 mt-2"
            >
              *Precisão calculada a partir do cruzamento de lançamentos e projeções históricas consolidadas.
            </motion.p>

            {/* Social Proof Row */}
            <motion.div
              variants={fadeUp}
              transition={transition(0.5, 0.7, reducedMotion)}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                <img className="w-7 h-7 rounded-full border border-neutral-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" alt="Usuário 1" />
                <img className="w-7 h-7 rounded-full border border-neutral-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80" alt="Usuário 2" />
                <img className="w-7 h-7 rounded-full border border-neutral-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" alt="Usuário 3" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <span>★★★★★</span>
                  <span className="font-semibold text-neutral-300">4.9/5</span>
                </div>
                <span className="text-2xs text-neutral-400">Avaliado como excelente por mais de 15.000 usuários</span>
              </div>
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

            <p className="sr-only">
              Mascote Tyller em render 3D metálico com moedas orbitando ao redor
            </p>

            <GlassCard
              className="absolute -left-1 md:left-0 top-6 p-3.5 max-w-[190px] hidden sm:block z-30"
              motionProps={{
                initial: { opacity: 0, x: -12 },
                animate: reducedMotion ? { opacity: 1, x: 0 } : {
                  opacity: 1,
                  x: 0,
                  y: [0, -6, 0]
                },
                transition: reducedMotion ? transition(0.55, 0.75, true) : {
                  x: { duration: 0.55, delay: 0.75, ease: "easeOut" },
                  opacity: { duration: 0.55, delay: 0.75, ease: "easeOut" },
                  y: {
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                    delay: 0.75
                  }
                }
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
              
              {/* Animated SVG Sparkline */}
              <div className="mt-2.5 h-6 w-full opacity-85">
                <svg className="w-full h-full" viewBox="0 0 100 24" fill="none">
                  <motion.path
                    d="M0 20 Q 20 5, 40 15 T 80 5 T 100 10"
                    stroke="var(--color-brand-400)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, delay: 1.3, ease: "easeOut" }}
                  />
                </svg>
              </div>
            </GlassCard>

            <GlassCard
              className="absolute -right-1 md:right-2 bottom-8 p-3.5 max-w-[190px] z-30"
              motionProps={{
                initial: { opacity: 0, x: 12 },
                animate: reducedMotion ? { opacity: 1, x: 0 } : {
                  opacity: 1,
                  x: 0,
                  y: [0, 6, 0]
                },
                transition: reducedMotion ? transition(0.55, 0.9, true) : {
                  x: { duration: 0.55, delay: 0.9, ease: "easeOut" },
                  opacity: { duration: 0.55, delay: 0.9, ease: "easeOut" },
                  y: {
                    repeat: Infinity,
                    duration: 4.5,
                    ease: "easeInOut",
                    delay: 0.9
                  }
                }
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="ds-icon-tile shrink-0 w-9 h-9 relative">
                  <Sparkles size={16} aria-hidden />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <div>
                  <p className="ds-stat-value text-sm">IA Proativa</p>
                  <p className="ds-card-subtitle text-2xs">
                    <span style={{ color: "var(--color-warning-500)" }} className="font-medium">3 alertas</span> esta semana
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Discrete scroll continuity indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 animate-bounce pointer-events-none">
        <span className="text-[9px] uppercase tracking-widest font-mono text-neutral-400">Scroll</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-300)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
