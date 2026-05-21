import { GlassCard } from './GlassCard';
import { EmptyState } from './EmptyState';
import { formatInsightLabel } from '../../utils/categoryBreakdown';

interface RecurrenceInsightsCardProps {
  patterns: string[];
  className?: string;
}

export function RecurrenceInsightsCard({ patterns, className = '' }: RecurrenceInsightsCardProps) {
  const labels = patterns
    .map((p) => formatInsightLabel(p))
    .filter((p) => p.length > 0)
    .filter((p) => !/aguardando|sem transações|sem assinaturas/i.test(p));

  const hasPatterns = labels.length > 0;

  return (
    <GlassCard className={`p-6 flex flex-col gap-4 ${className}`.trim()}>
      <div>
        <h3 className="ds-card-title">Gastos mais repetidos</h3>
        <p className="ds-card-subtitle mt-1">
          Saídas recorrentes no extrato — entradas não entram nesta lista
        </p>
      </div>

      {!hasPatterns ? (
        <EmptyState
          title="Ainda sem recorrências"
          description="Categorize suas transações para a IA identificar os lançamentos mais frequentes."
        />
      ) : (
        <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
          {labels.slice(0, 6).map((pattern, idx) => (
            <li
              key={`${idx}-${pattern.slice(0, 24)}`}
              className="ds-card-inset px-3.5 py-2.5 text-xs flex items-start gap-2.5"
              style={{ color: 'var(--color-neutral-300)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                style={{ backgroundColor: 'var(--color-brand-400)' }}
              />
              <span className="leading-relaxed">{pattern}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
