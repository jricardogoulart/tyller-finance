import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import TyllerComplete from "../layout/TyllerComplete";
import Texture from "../layout/Texture";
import { fadeUp, springFast, goToAuth } from "./motion";

// ─── Link data ────────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
  { label: "Recursos", href: "#features" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Planos", href: "#pricing" },
  { label: "Entrar", href: "#/auth" },
];

const COMPANY_LINKS = [
  { label: "Sobre", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Carreiras", href: "#" },
  { label: "Contato", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Termos de Uso", href: "#" },
  { label: "Privacidade", href: "#" },
  { label: "LGPD", href: "#" },
];

// ─── Footer column with animated underline links ──────────────────────────────

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4
        className="mb-4"
        style={{
          fontFamily: "var(--font-family-mono)",
          fontSize: "var(--font-size-2xs)",
          color: "var(--color-neutral-500)",
          letterSpacing: "var(--letter-spacing-widest)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="footer-link transition-colors hover:text-brand-400"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-neutral-400)",
                position: "relative",
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── LandingFooter ────────────────────────────────────────────────────────────

export function LandingFooter() {
  const year = new Date().getFullYear();
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const { scrollY } = useScroll();

  // Show scroll-to-top button after 200px
  useMotionValueEvent(scrollY, "change", (v) => setScrollTopVisible(v > 200));

  return (
    <>
      {/* ── Scroll-to-top FAB ─────────────────────────────────────────── */}
      <AnimatePresence>
        {scrollTopVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springFast}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            style={{
              backgroundColor: "var(--color-brand-400)",
              color: "var(--color-neutral-950)",
              fontWeight: "bold",
            }}
            aria-label="Voltar ao topo"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      <footer
        className="border-t mt-8"
        style={{
          borderColor: "var(--color-neutral-900)",
          backgroundColor: "var(--color-neutral-950)",
        }}
      >
        {/* ── Final CTA band ──────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          aria-label="Chamada para ação"
          style={{ backgroundColor: "var(--color-brand-400)" }}
        >
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <Texture
              color="#475d08"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full opacity-[0.12]"
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] h-[150%] rounded-[100%]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(248,253,232,0.45) 0%, transparent 62%)",
                filter: "blur(10px)",
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-28"
              style={{ background: "linear-gradient(180deg, var(--color-neutral-950) 0%, transparent 100%)" }}
            />
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-screen-xl mx-auto px-6 md:px-12 py-14 text-center"
          >
            <span
              className="inline-block mb-5"
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                letterSpacing: "var(--letter-spacing-widest)",
                textTransform: "uppercase",
                color: "var(--color-brand-900)",
              }}
            >
              Processo automatizado
            </span>

            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: "var(--font-weight-semibold)",
                lineHeight: "var(--line-height-tight)",
                color: "var(--color-neutral-950)",
              }}
            >
              Pronto para dominar suas finanças?
            </h2>
            <p
              className="max-w-lg mx-auto mb-8"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-base)",
                color: "var(--color-brand-900)",
                lineHeight: "var(--line-height-relaxed)",
              }}
            >
              Junte-se a milhares de usuários que já transformaram incerteza financeira em convicção.
            </p>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={goToAuth}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl cursor-pointer text-sm font-bold transition-all"
              style={{
                backgroundColor: "var(--color-neutral-950)",
                color: "var(--color-brand-400)",
                fontFamily: "var(--font-family-body)",
                boxShadow: "0 8px 24px rgba(10,12,9,0.25)",
              }}
            >
              Criar conta gratuita
              <ArrowRight size={16} aria-hidden />
            </motion.button>

            <p
              className="mt-4 flex items-center justify-center gap-1.5"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-brand-800)",
              }}
            >
              <ShieldCheck size={14} aria-hidden style={{ color: "var(--color-brand-900)" }} />
              Não requer cartão de crédito. Leva menos de 2 minutos.
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                color: "var(--color-brand-800)",
              }}
            >
              Junte-se a mais de 12.000 usuários que automatizaram suas finanças esta semana.
            </p>
          </motion.div>
        </section>

        <div className="glow-line max-w-screen-xl mx-auto" aria-hidden />

        {/* ── Footer content ──────────────────────────────────────────── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <TyllerComplete size="lg" style={{ color: "var(--color-neutral-100)" }} />
              <p
                className="mt-4 max-w-sm"
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-neutral-400)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                Seu assistente financeiro pessoal com IA proativa — saiba exatamente quanto vai sobrar no fim do mês.
              </p>
            </div>
            <FooterColumn title="Produto" links={PRODUCT_LINKS} />
            <FooterColumn title="Empresa" links={COMPANY_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>

          <div
            className="mt-8 pt-5 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: "var(--color-neutral-900)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                color: "var(--color-neutral-600)",
              }}
            >
              © {year} Tyller Finance. Todos os direitos reservados.
            </span>
            <span
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-2xs)",
                color: "var(--color-brand-500)",
              }}
            >
              Inteligência Proativa & Convicção
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
