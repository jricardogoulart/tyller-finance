import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ComponentsSection';
import api from '../utils/api';

interface TransactionItem {
  date: string;
  amount: number;
  description: string;
  hash: string;
}

interface ReviewListProps {
  transactions: TransactionItem[];
  fileHash: string;
  filename: string;
  onConfirm: (importedCount: number, skippedCount: number) => void;
  onCancel: () => void;
}

export function ReviewList({
  transactions: initialTransactions,
  fileHash,
  filename,
  onConfirm,
  onCancel,
}: ReviewListProps) {
  const [items, setItems] = useState<Array<TransactionItem & { selected: boolean }>>(
    initialTransactions.map(tx => ({ ...tx, selected: true }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Totals calculations
  const selectedItems = items.filter(i => i.selected);
  const totalIncome = selectedItems
    .filter(i => i.amount > 0)
    .reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = selectedItems
    .filter(i => i.amount < 0)
    .reduce((sum, i) => sum + i.amount, 0);

  const toggleSelectAll = () => {
    const allSelected = items.every(i => i.selected);
    setItems(items.map(i => ({ ...i, selected: !allSelected })));
  };

  const handleToggleSelect = (index: number) => {
    setItems(
      items.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleFieldChange = (index: number, field: 'description' | 'amount' | 'date', val: any) => {
    setItems(
      items.map((item, idx) => {
        if (idx === index) {
          let parsedVal = val;
          if (field === 'amount') {
            parsedVal = parseFloat(val) || 0;
          }
          return { ...item, [field]: parsedVal };
        }
        return item;
      })
    );
  };

  const handleImport = async () => {
    const payload = items
      .filter(i => i.selected)
      .map(({ date, amount, description, hash }) => ({
        date,
        amount,
        description,
        hash,
      }));

    if (payload.length === 0) {
      setError('Por favor, selecione pelo menos uma transação para importar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/transactions/import', {
        transactions: payload,
        filename,
        fileHash,
      });
      if (response.status === 200) {
        onConfirm(response.data.importedCount, response.data.skippedCount);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao gravar as transações no banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full rounded-2xl border p-6 flex flex-col gap-6"
      style={{
        backgroundColor: 'var(--color-neutral-900)',
        borderColor: 'var(--color-neutral-800)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)' as any,
              color: 'var(--color-neutral-100)',
            }}
          >
            Revisar Transações Extraídas
          </span>
          <span
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-neutral-400)',
            }}
          >
            Ajuste descrições ou desmarque despesas que não devem ser incluídas.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleImport} disabled={loading || selectedItems.length === 0}>
            {loading ? 'Processando...' : `Importar ${selectedItems.length} Transações`}
          </Button>
        </div>
      </div>

      {error && (
        <span
          className="text-xs p-3 rounded-lg border block"
          style={{
            backgroundColor: 'var(--color-error-950)',
            color: 'var(--color-error-500)',
            borderColor: 'var(--color-error-700)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          ⚠️ {error}
        </span>
      )}

      {/* Totals Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-neutral-850)', border: '1px solid var(--color-neutral-800)' }}>
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-2xs)', color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
            Selecionadas
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-neutral-200)' }}>
            {selectedItems.length} / {items.length}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-2xs)', color: 'var(--color-success-500)', textTransform: 'uppercase' }}>
            Total Receitas (+)
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-success-500)' }}>
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--font-size-2xs)', color: 'var(--color-brand-400)', textTransform: 'uppercase' }}>
            Total Despesas (-)
          </span>
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' as any, color: 'var(--color-brand-400)' }}>
            R$ {Math.abs(totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* SpreadSheet interactive Table */}
      <div className="overflow-x-auto max-h-[300px]" style={{ border: '1px solid var(--color-neutral-800)', borderRadius: '12px' }}>
        <table className="w-full text-left border-collapse">
          <thead style={{ backgroundColor: 'var(--color-neutral-850)', borderBottom: '1px solid var(--color-neutral-800)' }}>
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={items.every(i => i.selected)}
                  onChange={toggleSelectAll}
                  className="cursor-pointer rounded accent-brand"
                  style={{ width: '15px', height: '15px' }}
                />
              </th>
              <th className="p-3 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Data</th>
              <th className="p-3 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Descrição</th>
              <th className="p-3 text-xs uppercase text-right" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="transition-colors border-b last:border-0"
                style={{
                  borderColor: 'var(--color-neutral-850)',
                  backgroundColor: item.selected ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                  opacity: item.selected ? 1 : 0.45,
                }}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleToggleSelect(idx)}
                    className="cursor-pointer rounded accent-brand"
                    style={{ width: '14px', height: '14px' }}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => handleFieldChange(idx, 'date', e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs p-1 rounded hover:bg-neutral-800 focus:bg-neutral-800"
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      color: 'var(--color-neutral-300)',
                      width: '125px',
                    }}
                  />
                </td>
                <td className="p-2 w-full">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                    className="bg-transparent border-0 w-full outline-none text-xs p-1 rounded hover:bg-neutral-800 focus:bg-neutral-800"
                    style={{
                      fontFamily: 'var(--font-family-body)',
                      color: 'var(--color-neutral-200)',
                    }}
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleFieldChange(idx, 'amount', e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs text-right p-1 rounded hover:bg-neutral-800 focus:bg-neutral-800 font-mono"
                    style={{
                      color: item.amount > 0 ? 'var(--color-success-500)' : 'var(--color-neutral-200)',
                      fontWeight: 600,
                      width: '90px',
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
