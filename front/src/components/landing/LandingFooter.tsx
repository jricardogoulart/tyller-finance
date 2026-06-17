import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import TyllerComplete from "../layout/TyllerComplete";
import { fadeUp, goToAuth, transition } from "./motion";

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
              className="transition-colors hover:text-brand-400"
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-neutral-400)",
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

export function LandingFooter() {
  const reducedMotion = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-8"
      style={{
        borderColor: "var(--color-neutral-900)",
        backgroundColor: "var(--color-neutral-950)",
      }}
    >
      {/* Final CTA band */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        transition={transition(0.6, 0, reducedMotion)}
        className="max-w-screen-xl mx-auto px-6 md:px-12 py-16 text-center"
        aria-label="Chamada para ação"
      >
        <h2
          className="text-gradient-brand mb-4"
          style={{
            fontFamily: "var(--font-family-body)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "var(--line-height-tight)",
          }}
        >
          Pronto para dominar suas finanças?
        </h2>
        <p
          className="max-w-lg mx-auto mb-8"
          style={{
            fontFamily: "var(--font-family-body)",
            fontSize: "var(--font-size-base)",
            color: "var(--color-neutral-400)",
            lineHeight: "var(--line-height-relaxed)",
          }}
        >
          Junte-se a milhares de usuários que já transformaram incerteza financeira em convicção.
        </p>
        <motion.button
          type="button"
          whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          onClick={goToAuth}
          className="btn-tech inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl cursor-pointer text-sm"
        >
          Criar conta gratuita
          <ArrowRight size={16} aria-hidden />
        </motion.button>
      </motion.section>

      <div className="glow-line max-w-screen-xl mx-auto" aria-hidden />

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-14">
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
          className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
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
  );
}
