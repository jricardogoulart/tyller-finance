import { motion } from 'framer-motion';
import { CategoryBadge } from './CategoryBadge';

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onUpdateCategory?: (id: string, newCategory: string) => Promise<void>;
}

export function TransactionList({ transactions, loading, onUpdateCategory }: TransactionListProps) {
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-2xl gap-3" style={{ backgroundColor: 'var(--color-neutral-900)', borderColor: 'var(--color-neutral-800)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-8 h-8 rounded-full border-t-2"
          style={{ borderColor: 'var(--color-brand-400)', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
        />
        <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
          Carregando transações salvas...
        </span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl gap-4"
        style={{
          backgroundColor: 'var(--color-neutral-900)',
          borderColor: 'var(--color-neutral-800)',
          minHeight: '220px',
        }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: 'var(--color-neutral-850)', borderColor: 'var(--color-neutral-750)', color: 'var(--color-neutral-500)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-neutral-200)' }}>
            Nenhuma transação encontrada
          </span>
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-400)', maxWidth: '340px' }}>
            Seu histórico de lançamentos está limpo. Utilize a área de importação acima para carregar transações OFX ou PDF!
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex flex-col gap-4"
    >
      <div className="flex justify-between items-center px-1">
        <span
          style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'var(--color-neutral-200)',
          }}
        >
          Lançamentos Recentes ({transactions.length})
        </span>
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-2xs)',
            color: 'var(--color-neutral-500)',
          }}
        >
          ORDEM CRONOLÓGICA
        </span>
      </div>

      <div className="overflow-hidden border rounded-2xl" style={{ backgroundColor: 'var(--color-neutral-900)', borderColor: 'var(--color-neutral-800)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead style={{ backgroundColor: 'var(--color-neutral-850)', borderBottom: '1px solid var(--color-neutral-800)' }}>
              <tr>
                <th className="p-4 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Data</th>
                <th className="p-4 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Descrição</th>
                <th className="p-4 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Categoria</th>
                <th className="p-4 text-xs uppercase text-right" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const amountNum = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
                const isIncome = amountNum > 0;
                
                return (
                  <tr
                    key={tx.id}
                    className="border-b last:border-0 hover:bg-neutral-850/30 transition-colors"
                    style={{ borderColor: 'var(--color-neutral-850)' }}
                  >
                    <td className="p-4 text-xs" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td className="p-4 text-sm" style={{ fontFamily: 'var(--font-family-body)', color: 'var(--color-neutral-200)' }}>
                      {tx.description}
                    </td>
                    <td className="p-4">
                      {onUpdateCategory ? (
                        <CategoryBadge
                          category={tx.category}
                          transactionId={tx.id}
                          onUpdate={(newCat) => onUpdateCategory(tx.id, newCat)}
                        />
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            fontFamily: 'var(--font-family-mono)',
                            fontSize: 'var(--font-size-2xs)',
                            backgroundColor: tx.category === 'Não Categorizado' ? 'var(--color-neutral-850)' : 'var(--color-brand-950)',
                            color: tx.category === 'Não Categorizado' ? 'var(--color-neutral-400)' : 'var(--color-brand-400)',
                            border: tx.category === 'Não Categorizado' ? '1px solid var(--color-neutral-750)' : '1px solid var(--color-brand-800)',
                            padding: '0.1rem 0.5rem',
                          }}
                        >
                          {tx.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono text-sm" style={{
                      color: isIncome ? 'var(--color-success-500)' : 'var(--color-neutral-200)',
                      fontWeight: 600
                    }}>
                      {isIncome ? '+' : '-'} R$ {formatCurrency(Math.abs(amountNum))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
