import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { SectionHeader } from "./SectionHeader";
import { tokens } from "../tokens";

type TokenEntry = {
  path: string;
  value: string | number | readonly number[];
  type: string;
};

function flattenTokens(obj: Record<string, unknown>, prefix = ""): TokenEntry[] {
  const result: TokenEntry[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && "$value" in val) {
      const token = val as { $value: string | number | readonly number[]; $type: string };
      result.push({ path, value: token.$value, type: token.$type });
    } else if (val && typeof val === "object") {
      result.push(...flattenTokens(val as Record<string, unknown>, path));
    }
  }
  return result;
}

const allTokens = flattenTokens(tokens.primitive as unknown as Record<string, unknown>);

const TYPE_COLORS: Record<string, string> = {
  color:        "var(--color-brand-400)",
  fontSize:     "var(--color-info-500)",
  fontFamily:   "var(--color-warning-500)",
  fontWeight:   "var(--color-success-500)",
  lineHeight:   "var(--color-info-400)",
  letterSpacing:"var(--color-warning-400)",
  spacing:      "var(--color-neutral-400)",
  borderRadius: "var(--color-error-400)",
  boxShadow:    "var(--color-neutral-300)",
  duration:     "var(--color-brand-300)",
  cubicBezier:  "var(--color-success-400)",
  string:       "var(--color-brand-500)",
  dimension:    "var(--color-info-300)",
  number:       "var(--color-warning-300)",
};

const TYPES = ["all", ...Array.from(new Set(allTokens.map((t) => t.type)))];

export function TokenExplorer() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allTokens.filter((t) => {
      const matchType = activeType === "all" || t.type === activeType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.path.toLowerCase().includes(q) ||
        String(t.value).toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [search, activeType]);

  const copy = (token: TokenEntry) => {
    const val = Array.isArray(token.value)
      ? `cubic-bezier(${(token.value as number[]).join(", ")})`
      : String(token.value);
    navigator.clipboard.writeText(val);
    setCopied(token.path);
    setTimeout(() => setCopied(null), 1500);
  };

  const cssVar = (path: string) => {
    const parts = path.split(".");
    return `--${parts.join("-").replace(/\./g, "-")}`;
  };

  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="08"
        title="Token Explorer"
        description={`Browse all ${allTokens.length} design tokens. Search by name, value, or type — click any row to copy.`}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div
          className="relative flex-1"
          style={{
            backgroundColor: "var(--color-neutral-900)",
            border: "1px solid var(--color-neutral-800)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-neutral-600)", fontSize: "var(--font-size-sm)" }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens…"
            className="w-full bg-transparent outline-none pl-9 pr-4 py-3"
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-neutral-200)",
            }}
          />
        </div>

        {/* Count */}
        <div
          className="flex items-center px-4 rounded-xl border border-neutral-800 shrink-0"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-500)" }}>
            {filtered.length} tokens
          </span>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPES.map((t) => (
          <motion.button
            key={t}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveType(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-xs)",
              backgroundColor: activeType === t ? "var(--color-brand-400)" : "var(--color-neutral-900)",
              color: activeType === t ? "var(--color-neutral-950)" : "var(--color-neutral-400)",
              border: `1px solid ${activeType === t ? "var(--color-brand-400)" : "var(--color-neutral-800)"}`,
            }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* Token table */}
      <div
        className="rounded-2xl border border-neutral-800 overflow-hidden"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-800"
          style={{ backgroundColor: "var(--color-neutral-850)" }}
        >
          {["Token Path", "CSS Variable", "Value", "Type"].map((h) => (
            <div
              key={h}
              className={`${h === "Token Path" ? "col-span-4" : h === "CSS Variable" ? "col-span-3" : h === "Value" ? "col-span-3" : "col-span-2"}`}
              style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-widest)" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="max-h-[560px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-16"
              >
                <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-sm)", color: "var(--color-neutral-600)" }}>
                  No tokens match your search.
                </span>
              </motion.div>
            ) : (
              filtered.map((token, i) => {
                const isCopied = copied === token.path;
                const displayValue = Array.isArray(token.value)
                  ? `cubic-bezier(${(token.value as number[]).join(", ")})`
                  : String(token.value);
                const isColor = token.type === "color";

                return (
                  <motion.button
                    key={token.path}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.15) }}
                    onClick={() => copy(token)}
                    className="w-full grid grid-cols-12 gap-4 px-5 py-3 border-b border-neutral-800/50 text-left hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                  >
                    {/* Path */}
                    <div className="col-span-4 min-w-0">
                      <span
                        className="truncate block"
                        style={{
                          fontFamily: "var(--font-family-mono)",
                          fontSize: "var(--font-size-xs)",
                          color: isCopied ? "var(--color-brand-400)" : "var(--color-neutral-200)",
                        }}
                      >
                        {isCopied ? "✓ copied!" : token.path}
                      </span>
                    </div>

                    {/* CSS Var */}
                    <div className="col-span-3 min-w-0">
                      <span
                        className="truncate block"
                        style={{
                          fontFamily: "var(--font-family-mono)",
                          fontSize: "var(--font-size-2xs)",
                          color: "var(--color-neutral-600)",
                        }}
                      >
                        {cssVar(token.path)}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="col-span-3 min-w-0 flex items-center gap-2">
                      {isColor && (
                        <div
                          className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/10"
                          style={{ backgroundColor: String(token.value) }}
                        />
                      )}
                      <span
                        className="truncate"
                        style={{
                          fontFamily: "var(--font-family-mono)",
                          fontSize: "var(--font-size-xs)",
                          color: TYPE_COLORS[token.type] ?? "var(--color-neutral-400)",
                        }}
                      >
                        {displayValue}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          fontFamily: "var(--font-family-mono)",
                          fontSize: "var(--font-size-2xs)",
                          color: "var(--color-neutral-500)",
                          backgroundColor: "var(--color-neutral-850)",
                        }}
                      >
                        {token.type}
                      </span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
