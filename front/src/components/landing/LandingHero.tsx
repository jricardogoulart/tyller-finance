import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { GlassCard } from "../design-system";
import { HeroMascotScene } from "./HeroMascotScene";
import { heroCascade, fadeUp, fadeIn, scaleIn, goToAuth } from "./motion";

// ─── Typing word animation ────────────────────────────────────────────────────

function TypingWord() {
  const words = ["gastos", "futuro", "orçamento", "saldo"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => setBlink((p) => !p), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((p) => (p + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => setSubIndex((p) => p + (reverse ? -1 : 1)),
      reverse ? 75 : 150,
    );
    return () => clearTimeout(t);
  }, [subIndex, reverse, index]);

  return (
    <span className="text-gradient-brand-loop font-semibold">
      {words[index].substring(0, subIndex)}
      <span
        className={blink ? "opacity-100" : "opacity-0"}
        style={{ color: "var(--color-brand-400)" }}
      >
        |
      </span>
    </span>
  );
}

// ─── Sparkline draw (Web Animations API) ─────────────────────────────────────

function SparklineDraw() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        path.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 1200, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" },
        );
      }
    });
    observer.observe(path);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-2.5 h-6 w-full opacity-85">
      <svg className="w-full h-full" viewBox="0 0 100 24" fill="none">
        <path
          ref={pathRef}
          d="M0 20 Q 20 5, 40 15 T 80 5 T 100 10"
          stroke="var(--color-brand-400)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─── LandingHero ──────────────────────────────────────────────────────────────

export function LandingHero() {
  // ── Mouse parallax for glow orb ───────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const orbY = useSpring(mouseY, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.04);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.04);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <motion.section
      className="relative min-h-[65vh] flex flex-col justify-center pt-6 pb-6 md:pt-8 md:pb-8"
      aria-labelledby="landing-hero-title"
    >
      {/* Mouse-tracked glow orb */}
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-15"
        style={{
          x: orbX,
          y: orbY,
          background: "radial-gradient(circle, var(--color-brand-400) 0%, transparent 70%)",
          willChange: "transform",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          {/* ── Copy column — hero cascade stagger ──────────────────────── */}
          <motion.div
            variants={heroCascade}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
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

            {/* Headline */}
            <motion.div variants={fadeUp} className="animate-float-slow relative">
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

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-lg"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-lg)",
                color: "var(--color-neutral-400)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Saiba exatamente quanto vai sobrar no fim do mês. Evite surpresas no orçamento com alertas automáticos e previsões em tempo real da nossa inteligência artificial.
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 w-full max-w-md mt-6">
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

            {/* CTAs */}
            <motion.div variants={scaleIn} className="flex flex-wrap gap-3 mt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToAuth}
                className="btn-tech flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer text-sm"
              >
                Começar gratuitamente
                <ArrowRight size={16} aria-hidden />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-tech-outline flex items-center gap-2 px-6 py-3 rounded-2xl cursor-pointer text-sm"
              >
                Ver como funciona
              </motion.button>
            </motion.div>

            {/* Micro guarantees */}
            <motion.div
              variants={fadeUp}
              className="text-2xs text-neutral-500 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1"
            >
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-brand-400" /> Sem necessidade de cartão de crédito
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Segurança nível bancário com criptografia de ponta a ponta</span>
            </motion.div>

            <motion.p variants={fadeUp} className="text-[10px] text-neutral-600 mt-2">
              *Precisão calculada a partir do cruzamento de lançamentos e projeções históricas consolidadas.
            </motion.p>

            {/* Social proof row */}
            <motion.div variants={fadeUp} className="mt-6 flex items-center gap-3">
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

          {/* ── Mascot + floating glass cards ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex w-full justify-end"
          >
            {/* Mascot */}
            <HeroMascotScene />

            <p className="sr-only">Mascote Tyller em render 3D metálico com moedas orbitando ao redor</p>

            {/* "Sobra projetada" card with sparkline SVG draw */}
            <GlassCard
              className="absolute left-0 top-6 p-3.5 max-w-[190px] hidden sm:block z-30"
              motionProps={{
                initial: { opacity: 0, x: -12 },
                animate: { opacity: 1, x: 0, y: [0, -6, 0] },
                transition: {
                  x: { duration: 0.55, delay: 0.75, ease: "easeOut" },
                  opacity: { duration: 0.55, delay: 0.75, ease: "easeOut" },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.75 },
                },
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
              <SparklineDraw />
            </GlassCard>

            {/* IA Proativa card */}
            <GlassCard
              className="absolute right-0 bottom-8 p-3.5 max-w-[190px] z-30"
              motionProps={{
                initial: { opacity: 0, x: 12 },
                animate: { opacity: 1, x: 0, y: [0, 6, 0] },
                transition: {
                  x: { duration: 0.55, delay: 0.9, ease: "easeOut" },
                  opacity: { duration: 0.55, delay: 0.9, ease: "easeOut" },
                  y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.9 },
                },
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

      {/* Scroll continuity indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 animate-bounce pointer-events-none">
        <span className="text-[9px] uppercase tracking-widest font-mono text-neutral-400">Scroll</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-300)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </motion.section>
  );
}
