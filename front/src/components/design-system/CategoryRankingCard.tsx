import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import type { CategoryBreakdownItem, CashFlowTotals } from '../../utils/categoryBreakdown';

interface CategoryRankingCardProps {
  items: CategoryBreakdownItem[];
  cashFlow?: CashFlowTotals;
  monthlyAverageExpense?: number;
  onViewDetails?: () => void;
  className?: string;
  motionProps?: HTMLMotionProps<'div'>;
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CategoryRankingCard({
  items,
  cashFlow,
  monthlyAverageExpense,
  onViewDetails,
  className = '',
  motionProps,
}: CategoryRankingCardProps) {
  const topItems = items.slice(0, 5);
  const leader = topItems[0];

  const card = (
    <GlassCard className={`p-6 flex flex-col gap-4 h-full ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="ds-icon-tile flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="ds-card-title">Ranking de Categorias</h3>
            <p className="ds-card-subtitle mt-0.5">
              Apenas saídas — para simular economia nos gastos
            </p>
          </div>
        </div>
        <StatusBadge label="Ao vivo" variant="success" className="flex-shrink-0" />
      </div>

      {cashFlow && (cashFlow.totalIn > 0 || cashFlow.totalOut > 0) && (
        <div className="grid grid-cols-2 gap-2">
          <div className="ds-card-inset p-3 flex flex-col gap-0.5">
            <span className="ds-stat-label">Entrou</span>
            <span className="ds-stat-value text-sm" style={{ color: 'var(--color-success-400, #4ade80)' }}>
              R$ {formatBRL(cashFlow.totalIn)}
            </span>
          </div>
          <div className="ds-card-inset p-3 flex flex-col gap-0.5">
            <span className="ds-stat-label">Saiu</span>
            <span className="ds-stat-value text-sm" style={{ color: 'var(--color-error-500, #f87171)' }}>
              R$ {formatBRL(cashFlow.totalOut)}
            </span>
          </div>
        </div>
      )}

      {monthlyAverageExpense !== undefined && monthlyAverageExpense > 0 && (
        <div className="ds-card-inset p-3 flex justify-between items-center gap-2">
          <span className="ds-stat-label">Média mensal de despesas</span>
          <span className="ds-stat-value text-sm">
            R${' '}
            {monthlyAverageExpense.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      )}

      {leader && (
        <div className="flex justify-between items-center gap-2">
          <span className="ds-stat-label">Categoria líder</span>
          <span className="ds-stat-value-brand">{leader.category}</span>
        </div>
      )}

      {topItems.length === 0 ? (
        <EmptyState
          title="Sem ranking ainda"
          description="Importe e categorize transações para ver o ranking por categoria."
        />
      ) : (
        <div className="flex flex-col gap-2.5 flex-1">
          {topItems.map((cat, idx) => (
            <div key={cat.category} className="ds-card-inset p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold" style={{ color: 'var(--color-neutral-200)' }}>
                  <span className="font-mono text-neutral-500 mr-1.5">#{idx + 1}</span>
                  {cat.category}
                </span>
                <span className="font-mono font-bold" style={{ color: 'var(--color-brand-400)' }}>
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={cat.percentage} delay={0.04 * idx} />
            </div>
          ))}
        </div>
      )}

      {onViewDetails && (
        <button
          type="button"
          onClick={onViewDetails}
          className="btn-tech-outline w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-auto"
        >
          Ver transações
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </GlassCard>
  );

  if (motionProps) {
    return <motion.div {...motionProps}>{card}</motion.div>;
  }

  return card;
}
