
import { motion } from 'framer-motion';

interface ActionPlanPanelProps {
  plan: string;
  loading: boolean;
  onGenerate: () => void;
}

export function ActionPlanPanel({ plan, loading, onGenerate }: ActionPlanPanelProps) {
  // Parser de Markdown simples para renderizar títulos e listas com design tokens
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return (
          <h3 key={i} className="text-lg font-semibold mt-4 mb-3 text-neutral-50 flex items-center gap-2">
            {trimmed.replace('###', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('####')) {
        return (
          <h4 key={i} className="text-md font-semibold mt-4 mb-2 text-brand-400">
            {trimmed.replace('####', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.')) {
        return (
          <div key={i} className="pl-4 my-2.5 text-neutral-200 text-sm font-normal border-l-2 border-brand-500/30 leading-relaxed">
            <span className="font-semibold text-brand-400">{trimmed.slice(0, 2)}</span> {trimmed.slice(2)}
          </div>
        );
      }
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
        return (
          <p key={i} className="text-xs italic text-neutral-400 mt-4 text-center">
            {trimmed.replace(/\*/g, '')}
          </p>
        );
      }
      if (trimmed) {
        return (
          <p key={i} className="text-sm text-neutral-200 font-normal leading-relaxed my-2">
            {trimmed}
          </p>
        );
      }
      return <div key={i} className="h-2" />;
    });
  };

  return (
    <div className="w-full rounded-2xl border p-6 flex flex-col gap-4 relative overflow-hidden" style={{
      backgroundColor: 'var(--color-neutral-900)',
      borderColor: 'var(--color-neutral-800)',
    }}>
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'var(--color-neutral-100)'
          }}>
            Plano de Ação Estratégico por IA
          </h3>
          <p className="text-xs text-neutral-400">
            Sugestões personalizadas de corte baseadas no seu perfil e meta
          </p>
        </div>
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05, translateY: loading ? 0 : -1 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={onGenerate}
          disabled={loading}
          className="btn-tech-outline px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
        >
          {loading ? 'Gerando Plano...' : 'Otimizar Plano'}
        </motion.button>
      </div>

      <div className="min-h-[150px] relative">
        {loading ? (
          <div className="flex flex-col gap-3 py-6 animate-pulse">
            <div className="h-6 w-2/3 bg-neutral-800 rounded" />
            <div className="h-4 w-full bg-neutral-800 rounded" />
            <div className="h-4 w-5/6 bg-neutral-800 rounded" />
            <div className="h-16 w-full bg-neutral-800 rounded mt-2" />
          </div>
        ) : plan ? (
          <div className="py-2 text-neutral-200 max-h-[310px] overflow-y-auto pr-2">
            {renderMarkdown(plan)}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-neutral-400">
            Selecione uma meta e clique em "Otimizar Plano" para receber as sugestões estruturadas pela IA.
          </div>
        )}
      </div>
    </div>
  );
}
