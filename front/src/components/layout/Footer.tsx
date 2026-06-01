import TyllerComplete from "./TyllerComplete";

export function Divider({ label }: { label: string }) {
  return (
    <div className="relative max-w-screen-xl mx-auto px-6 md:px-12 py-2">
      <div className="glow-line" />
      {label && (
        <span
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 top-1/2"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-700)",
            backgroundColor: "var(--color-neutral-950)",
            letterSpacing: "var(--letter-spacing-widest)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

interface FooterProps {
  isDesignSystem?: boolean;
}

export function Footer({ isDesignSystem }: FooterProps) {
  if (isDesignSystem) {
    return (
      <footer
        className="border-t py-12 px-6 md:px-12"
        style={{
          borderColor: "var(--color-neutral-900)",
          backgroundColor: "var(--color-neutral-950)",
        }}
      >
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <TyllerComplete className="h-6 w-auto" />
              <span
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-neutral-200)",
                }}
              >
                Motion Design System
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-neutral-600)",
              }}
            >
              Inspired by Code Resolution® — Agency Growth Partner
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { label: "Colors",      count: "56" },
              { label: "Typography",  count: "26" },
              { label: "Spacing",     count: "20" },
              { label: "Motion",      count: "18" },
              { label: "Radius",      count: "8"  },
              { label: "Shadows",     count: "8"  },
              { label: "Z-Index",     count: "10" },
              { label: "Breakpoints", count: "5"  },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-brand-400)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {item.count}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-600)",
                    marginTop: "2px",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="max-w-screen-xl mx-auto mt-10 pt-6 border-t flex items-center justify-between"
          style={{ borderColor: "var(--color-neutral-900)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-700)",
            }}
          >
            Primitive tokens · Semantic system · Motion language
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-700)",
            }}
          >
            v1.0.0 — 2026
          </span>
        </div>
      </footer>
    );
  }

  // TyllerFinance Standard Footer
  return (
    <footer
      className="border-t py-12 px-6 md:px-12"
      style={{
        borderColor: "var(--color-neutral-900)",
        backgroundColor: "var(--color-neutral-950)",
      }}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <TyllerComplete className="h-6 w-auto" />
          </div>
          <p
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-neutral-400)",
              maxWidth: "450px",
              lineHeight: "1.6",
            }}
          >
            Seu assistente financeiro pessoal com IA proativa — saiba exatamente quanto vai sobrar no fim do mês.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-1.5">
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-600)",
              letterSpacing: "var(--letter-spacing-wider)",
              textTransform: "uppercase",
            }}
          >
            Soberania Financeira © {new Date().getFullYear()}
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
