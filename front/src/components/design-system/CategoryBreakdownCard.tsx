import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';
import { EmptyState } from './EmptyState';
import type { CategoryBreakdownItem } from '../../utils/categoryBreakdown';

interface CategoryBreakdownCardProps {
  title?: string;
  subtitle?: string;
  items: CategoryBreakdownItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function CategoryBreakdownCard({
  title = 'Distribuição de Gastos por Categoria',
  subtitle = 'Percentual de despesas com base nas categorias atuais',
  items,
  emptyTitle = 'Sem despesas categorizadas',
  emptyDescription = 'Importe um extrato e categorize os lançamentos para ver o gráfico.',
  className = '',
}: CategoryBreakdownCardProps) {
  return (
    <GlassCard className={`p-6 flex flex-col gap-4 ${className}`.trim()}>
      <div>
        <h3 className="ds-card-title">{title}</h3>
        <p className="ds-card-subtitle mt-1">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((cat, idx) => (
            <div key={cat.category} className="ds-card-inset p-3 flex flex-col gap-1.5">
              <div className="flex justify-between items-center gap-2">
                <span className="ds-stat-label text-xs">{cat.category}</span>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-neutral-300)' }}>
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={cat.percentage} delay={0.05 * idx} />
              <span className="text-[10px] font-mono" style={{ color: 'var(--color-neutral-500)' }}>
                R${' '}
                {cat.amount.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
