# UltraMotionDesign — Tyller Finance Landing Page

> Objetivo: página como filme. Seções não terminam — transformam na próxima.

---

## Arquitetura de Motion

### Dois tipos de animação — separar sempre

| Tipo | Hook | Quando usar |
|------|------|-------------|
| ScrollLinked | `useScroll + useTransform` | Resposta pixel-a-pixel (parallax, linha timeline, fundo) |
| ScrollTriggered | `whileInView` | Disparo único ao entrar no viewport (stagger, countUp) |

### Config global — `App.tsx`

```tsx
// App.tsx
import { MotionConfig } from "framer-motion"

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router />
    </MotionConfig>
  )
}
```

Elimina checagem manual de `useReducedMotion()` em cada componente.

---

## `motion.ts` — Revisão Completa

Substituir arquivo atual por versão expandida:

```ts
// motion.ts

import { Variants, Transition } from "framer-motion"

// --- Transitions base ---
export const spring = (stiffness = 300, damping = 30): Transition => ({
  type: "spring", stiffness, damping
})

export const springFast: Transition = spring(400, 40)
export const springMed:  Transition = spring(300, 30)
export const springSlow: Transition = spring(200, 30)

export const ease04: Transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
export const ease06: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] }

// --- Variants reutilizáveis ---
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: springMed }
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: ease04 }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springMed }
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: springMed }
}

export const pushNotif: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1, x: 0,
    transition: { ...springFast, delay: 0.2 }
  }
}

// --- Stagger container ---
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } }
})

// --- Hero cascade (stagger 120ms) ---
export const heroCascade = staggerContainer(0.12, 0.1)

// --- Bento grid (stagger 80ms) ---
export const bentoGrid = staggerContainer(0.08, 0.15)

// --- Hover / Tap ---
export const hoverLift = {
  whileHover: { scale: 1.02, y: -4, transition: springSlow },
  whileTap:   { scale: 0.97, transition: springFast }
}

export const hoverGlow = {
  whileHover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 0 0 1px #bef030, 0 8px 32px rgba(190,240,48,0.18)",
    transition: springSlow
  },
  whileTap: { scale: 0.97 }
}

// --- ScrollScene exit (afundamento) ---
export const scrollExitSink: Variants = {
  visible: { scale: 1, filter: "blur(0px)", opacity: 1 },
  exit:    { scale: 0.95, filter: "blur(3px)", opacity: 0, transition: ease04 }
}

// --- Clip-path reveals ---
export const clipRevealUp: Variants = {
  hidden:  { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: ease06 }
}

export const clipRevealDiag: Variants = {
  hidden:  { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
  visible: { clipPath: "polygon(0 15%, 100% 0%, 100% 100%, 0 100%)", transition: ease06 }
}
```

---

## Scroll Scenes — Containers de Transição

Criar componente `ScrollScene.tsx`:

```tsx
// components/landing/ScrollScene.tsx
"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface Props {
  height?: number      // altura da zona de transição (px)
  children: React.ReactNode
}

export function ScrollScene({ height = 250, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={ref} style={{ height }} className="relative overflow-hidden">
      {children}
    </div>
  )
}
```

Uso entre seções — exemplo entre Bento e Timeline:

```tsx
// LandingPage.tsx
<FeatureBento />

<ScrollScene height={300}>
  <BentoToTimelineTransition />  {/* componente da transição */}
</ScrollScene>

<HowItWorksTimeline />
```

---

## Seção 00 — LandingNav

### Entrada
```tsx
<motion.nav
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={ease06}
>
```

### Blur progressivo no scroll
```tsx
const { scrollY } = useScroll()
const blur = useTransform(scrollY, [0, 80], [0, 16])
const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85])

<motion.nav style={{
  backdropFilter: useMotionTemplate`blur(${blur}px)`,
  backgroundColor: useMotionTemplate`rgba(10,12,9,${bgOpacity})`
}}>
```

### Progress bar de leitura
```tsx
const { scrollYProgress } = useScroll()
const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })

<motion.div
  className="fixed bottom-0 left-0 h-[2px] w-full origin-left bg-brand-400"
  style={{ scaleX }}
/>
```

### Logo shrink no scroll
```tsx
const logoScale = useTransform(scrollY, [0, 100], [1, 0.85])
<motion.img style={{ scale: logoScale }} src="/logo.svg" />
```

---

## Seção 01 — LandingHero

### Stagger cascade
```tsx
<motion.section variants={heroCascade} initial="hidden" animate="visible">
  <motion.div variants={fadeIn}>   {/* badge */}    </motion.div>
  <motion.h1  variants={fadeUp}>   {/* headline */} </motion.h1>
  <motion.p   variants={fadeUp}>   {/* subtext */}  </motion.p>
  <motion.div variants={scaleIn}>  {/* CTAs */}     </motion.div>
  <motion.div variants={fadeUp}>   {/* cards */}    </motion.div>
</motion.section>
```

### Parallax do mascote
```tsx
const { scrollYProgress } = useScroll()
const mascoteY = useTransform(scrollYProgress, [0, 0.4], [0, -80])

<motion.div style={{ y: mascoteY }}>
  <HeroMascotScene />
</motion.div>
```

### Mouse parallax no glow orb
```tsx
const mouseX = useMotionValue(0)
const mouseY = useMotionValue(0)
const orbX = useSpring(mouseX, { stiffness: 200, damping: 30 })
const orbY = useSpring(mouseY, { stiffness: 200, damping: 30 })

useEffect(() => {
  const handler = (e: MouseEvent) => {
    mouseX.set((e.clientX - window.innerWidth  / 2) * 0.04)
    mouseY.set((e.clientY - window.innerHeight / 2) * 0.04)
  }
  window.addEventListener("mousemove", handler)
  return () => window.removeEventListener("mousemove", handler)
}, [])

<motion.div className="glow-orb" style={{ x: orbX, y: orbY }} />
```

### Sparkline SVG draw
```tsx
// Dentro do GlassCard de "Sobra projetada"
const pathRef = useRef<SVGPathElement>(null)

useEffect(() => {
  const path = pathRef.current
  if (!path) return
  const len = path.getTotalLength()
  path.style.strokeDasharray  = `${len}`
  path.style.strokeDashoffset = `${len}`

  const observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      path.animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 1200, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      )
    }
  })
  observer.observe(path)
  return () => observer.disconnect()
}, [])
```

### ScrollScene — Hero → LogoMarquee
```tsx
// Bento sobe por baixo com overlap de 120px
// Hero faz parallax exit
const heroOpacity = useTransform(scrollYProgress, [0.25, 0.45], [1, 0])
const heroY       = useTransform(scrollYProgress, [0.25, 0.45], [0, -60])

<motion.section style={{ opacity: heroOpacity, y: heroY }}>
  <LandingHero />
</motion.section>
```

---

## Seção 02 — LogoMarquee

### Clip-path entrada
```tsx
<motion.div
  variants={clipRevealUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
>
  <LogoMarquee />
</motion.div>
```

### Fade masks CSS
```css
/* index.css */
.marquee-wrapper {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
}
```

### ScrollScene — LogoMarquee → FeatureBento
```tsx
// 0.4s blur+scale de saída do marquee
const exitProgress = useTransform(scrollYProgress, [0.8, 1], [0, 1])
const marqueeBlur  = useTransform(exitProgress, [0, 1], [0, 4])
const marqueeScale = useTransform(exitProgress, [0, 1], [1, 0.98])
```

---

## Seção 03 — FeatureBento

### Stagger reveal dos cards
```tsx
<motion.div
  variants={bentoGrid}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
  className="bento-grid"
>
  {features.map(f => (
    <motion.div key={f.id} variants={fadeUp} {...hoverGlow}>
      <FeatureCard {...f} />
    </motion.div>
  ))}
</motion.div>
```

### Notificação IA Proativa
```tsx
// Feature01Card.tsx
<AnimatePresence>
  {showNotif && (
    <motion.div
      variants={pushNotif}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
    >
      {/* card de notificação */}
    </motion.div>
  )}
</AnimatePresence>
```

Vibração ao aparecer:
```tsx
const shakeVariant: Variants = {
  shake: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.4, delay: 0.5 }
  }
}
```

### CountUp no card de projeção
```tsx
// hooks/useCountUp.ts
export function useCountUp(target: number, duration = 1500) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)  // easeOutCubic
        setVal(Math.round(target * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { val, ref }
}
```

### ScrollScene — Bento → Timeline (afundamento)
```tsx
// BentoToTimelineScene.tsx
export function BentoToTimelineScene() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end","end start"] })

  const bentoScale   = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const bentoBlur    = useTransform(scrollYProgress, [0, 1], [0, 3])
  const bentoOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <div ref={ref} className="sticky top-0 h-[300px]">
      <motion.div style={{
        scale:  bentoScale,
        filter: useMotionTemplate`blur(${bentoBlur}px)`,
        opacity: bentoOpacity
      }} />
    </div>
  )
}
```

---

## Seção 04 — HowItWorksTimeline

### Linha crescendo com scroll
```tsx
const ref = useRef<HTMLDivElement>(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start center", "end center"]
})
const lineScaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

<motion.div
  className="timeline-line origin-top"
  style={{ scaleY: lineScaleY }}
/>
```

### Steps sticky
```tsx
// Cada step ocupa 300px de scroll zone
// CSS:
// .step-wrapper { height: 300px; }
// .step-content { position: sticky; top: 40vh; }

steps.map((step, i) => (
  <div key={i} className="step-wrapper">
    <motion.div
      className="step-content"
      whileInView={{ scale: [1, 1.04, 1] }}
      viewport={{ once: false, margin: "-40% 0px -40% 0px" }}
      transition={{ duration: 0.3 }}
    >
      <StepNumber active={activeStep === i} number={i + 1} />
      <StepContent {...step} />
    </motion.div>
  </div>
))
```

### Morphing de mockup entre steps
```tsx
// DeviceMockup.tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeStep}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{   opacity: 0, y: -8 }}
    transition={ease04}
  >
    <MockupScreen step={activeStep} />
  </motion.div>
</AnimatePresence>
```

### Partículas no step 3
```tsx
// ParticlesBurst.tsx
export function ParticlesBurst({ trigger }: { trigger: boolean }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 120 - 60,
    delay: Math.random() * 0.4
  }))

  return (
    <AnimatePresence>
      {trigger && particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-brand-400"
          initial={{ opacity: 1, y: 0, x: p.x }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  )
}
```

### ScrollScene — Timeline → SocialProof (fundo escuro → claro)
```tsx
const bgColor = useTransform(
  scrollYProgress,
  [0, 1],
  ["#0a0c09", "#f5f0eb"]
)
// interpolar via motion value — não via CSS class toggle
<motion.div style={{ backgroundColor: bgColor }} />
```

Clip diagonal emergindo:
```tsx
const clipProgress = useTransform(scrollYProgress, [0.6, 1], [0, 1])
const clip = useMotionTemplate`polygon(0 ${useTransform(clipProgress,[0,1],[100,15])}%, 100% ${useTransform(clipProgress,[0,1],[100,0])}%, 100% 100%, 0 100%)`
<motion.div style={{ clipPath: clip }} className="bg-[#f5f0eb]" />
```

---

## Seção 05 — SocialProof

### Carrossel com drag
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -(cardWidth * (cards.length - 1)), right: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => {
    const threshold = cardWidth * 0.3
    if (info.offset.x < -threshold) next()
    if (info.offset.x >  threshold) prev()
  }}
  animate={{ x: -currentIndex * cardWidth }}
  transition={springFast}
>
  {cards.map(c => <TestimonialCard key={c.id} {...c} />)}
</motion.div>
```

### CountUp nas stats
```tsx
// Proporcional ao valor — números grandes aceleram mais devagar
const duration = Math.log10(target) * 600  // 12k → ~2.4s, 2.1M → ~3.8s
const { val, ref } = useCountUp(target, duration)
```

### Parallax no SVG de moedas
```tsx
const { scrollYProgress } = useScroll()
const patternY = useTransform(scrollYProgress, [0, 1], [0, -80])

<motion.div className="coin-pattern-bg" style={{ y: patternY }} />
```

### ScrollScene — SocialProof → Pricing (fan-out)
```tsx
// Depoimentos giram para fora
const fanVariants = {
  exit: (i: number) => ({
    rotate: (i - 1) * 5,
    opacity: 0,
    transition: { ...ease04, delay: i * 0.05 }
  })
}
```

---

## Seção 06 — Pricing

### Toggle com layout animation
```tsx
<div className="relative flex bg-neutral-900 rounded-full p-1">
  {["Mensal","Anual"].map(period => (
    <button key={period} onClick={() => setBilling(period)} className="relative px-4 py-1.5 text-sm">
      {billing === period && (
        <motion.div
          layoutId="billing-indicator"  // framer faz o slide automaticamente
          className="absolute inset-0 bg-brand-400 rounded-full"
          transition={springMed}
        />
      )}
      <span className="relative z-10">{period}</span>
    </button>
  ))}
</div>
```

### Crossfade dos preços
```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={billing}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{   opacity: 0, y: -8 }}
    transition={ease04}
  >
    {price}
  </motion.span>
</AnimatePresence>
```

### Card Pro — glow pulsante
```css
/* index.css */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0px 0px rgba(190,240,48,0); }
  50%       { box-shadow: 0 0 20px 4px rgba(190,240,48,0.25); }
}

.pricing-card-pro {
  animation: glow-pulse 2.5s ease-in-out infinite;
  transform: scale(1.04);
}
```

### Hover holográfico no card Pro
```css
@property --holo-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@keyframes holo-rotate {
  to { --holo-angle: 360deg; }
}

.pricing-card-pro:hover {
  background: linear-gradient(var(--holo-angle), #0a0c09 0%, #1a2a0a 50%, #0a0c09 100%);
  animation: holo-rotate 3s linear infinite;
}
```

### Micro-confetti no CTA
```tsx
// ConfettiBurst.tsx
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const items = Array.from({ length: 20 }, (_, i) => ({
    x: (Math.random() - 0.5) * 160,
    y: (Math.random() - 0.5) * 80,
    rotate: Math.random() * 360,
    color: ["#bef030","#ffffff","#7f77dd"][i % 3]
  }))

  return (
    <AnimatePresence>
      {trigger && items.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-sm pointer-events-none"
          style={{ backgroundColor: p.color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
          exit={{}}
          transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.02 }}
        />
      ))}
    </AnimatePresence>
  )
}
```

### ScrollScene — Pricing → Footer
```tsx
const exitScale   = useTransform(scrollYProgress, [0.8, 1], [1, 0.96])
const exitOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0])
// footer faz clip-path reveal bottom → top
```

---

## Seção 07 — LandingFooter

### Status indicator pulse
```css
@keyframes status-ping {
  0%   { transform: scale(1);   opacity: 1; }
  75%  { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.status-dot::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #4ade80;
  animation: status-ping 2s cubic-bezier(0,0,.2,1) infinite;
}
```

### Botão scroll-to-top
```tsx
const { scrollY } = useScroll()
const [visible, setVisible] = useState(false)

useMotionValueEvent(scrollY, "change", v => setVisible(v > 200))

<AnimatePresence>
  {visible && (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{    scale: 0, opacity: 0 }}
      transition={springFast}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </motion.button>
  )}
</AnimatePresence>
```

### Links underline animado
```css
.footer-link {
  position: relative;
}
.footer-link::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0%;
  height: 1px;
  background: currentColor;
  transition: width 0.2s ease;
}
.footer-link:hover::after {
  width: 100%;
}
```

---

## Ordem de Implementação

1. `motion.ts` — revisar primeiro, tudo depende daqui
2. `App.tsx` — adicionar `MotionConfig`
3. `LandingNav` — entrada + blur scroll + progress bar
4. `LandingHero` — stagger cascade + mouse orb + sparkline + parallax
5. `ScrollScene.tsx` — componente de transição genérico
6. `LogoMarquee` — clip reveal + fade masks
7. `FeatureBento` — stagger + pushNotif + countUp + hoverGlow
8. ScrollScene Bento→Timeline — afundamento
9. `HowItWorksTimeline` — sticky steps + linha scroll + morphing + partículas
10. ScrollScene Timeline→SocialProof — fundo interpolado + clip diagonal
11. `SocialProof` — drag carousel + countUp proporcional + parallax bg
12. ScrollScene SocialProof→Pricing — fan-out
13. `Pricing` — layout animation toggle + AnimatePresence preços + glow + confetti
14. `LandingFooter` — status pulse + scroll-to-top + underline

---

## Dependências necessárias

```bash
# já tem framer-motion — confirmar versão ≥ 11 para layout animations
npm list framer-motion

# CSS @property para efeito holográfico (nativo nos browsers modernos, sem deps)
# IntersectionObserver — nativo, sem deps
# Web Animations API (sparkline) — nativo, sem deps
```

---

## Performance — Regras

- Animar APENAS `transform` e `opacity` em elementos com muitos filhos
- `will-change: transform` apenas nos elementos de parallax pesado (mascote, glow orb)
- `useSpring` com `stiffness ≤ 200` em scroll-linked — stiffness alta = jank
- Todas as animações dentro de `@media (prefers-reduced-motion: no-preference)` — MotionConfig já garante isso via framer
- `viewport={{ once: true }}` em animações de entrada (whileInView) — não re-animar no scroll reverso
- ScrollScene heights mínimas: 200px. Menores criam jank por frames insuficientes