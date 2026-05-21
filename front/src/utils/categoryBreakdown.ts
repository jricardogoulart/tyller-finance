export interface CategoryBreakdownItem {
  category: string;
  percentage: number;
  amount: number;
}

const PENDING_CATEGORIES = new Set([
  'Outros',
  'PENDENTE_CLASSIFICACAO',
  'Não Categorizado',
  '',
]);

/** Categorias tipicamente de entrada — não entram no ranking de gastos. */
const INCOME_CATEGORY_LABELS = new Set(['Receita']);

export interface CashFlowTotals {
  totalIn: number;
  totalOut: number;
  net: number;
}

export interface CategoryFlowGroups {
  expenseCategories: string[];
  incomeCategories: string[];
}

function parseAmount(amount: number | string): number {
  return typeof amount === 'string' ? parseFloat(amount) : Number(amount);
}

export function computeCashFlowTotals(
  transactions: Array<{ amount: number | string }>
): CashFlowTotals {
  let totalIn = 0;
  let totalOut = 0;

  for (const tx of transactions) {
    const amount = parseAmount(tx.amount);
    if (!amount) continue;
    if (amount > 0) totalIn += amount;
    else totalOut += Math.abs(amount);
  }

  return { totalIn, totalOut, net: totalIn - totalOut };
}

/** Categorias usadas em saídas vs entradas, ordenadas pelo volume em cada lado. */
export function partitionCategoriesByFlow(
  transactions: Array<{ amount: number | string; category?: string }>
): CategoryFlowGroups {
  const expenseByCat: Record<string, number> = {};
  const incomeByCat: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = parseAmount(tx.amount);
    if (!amount) continue;
    const category = (tx.category || 'Não Categorizado').trim();
    if (PENDING_CATEGORIES.has(category)) continue;

    if (amount < 0) {
      expenseByCat[category] = (expenseByCat[category] || 0) + Math.abs(amount);
    } else {
      incomeByCat[category] = (incomeByCat[category] || 0) + amount;
    }
  }

  const sortByVolume = (record: Record<string, number>) =>
    Object.entries(record)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

  return {
    expenseCategories: sortByVolume(expenseByCat),
    incomeCategories: sortByVolume(incomeByCat),
  };
}

export function computeCategoryBreakdown(
  transactions: Array<{ amount: number | string; category?: string }>
): CategoryBreakdownItem[] {
  const byCategory: Record<string, number> = {};
  let totalExpenses = 0;

  for (const tx of transactions) {
    const amount =
      typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
    if (!amount || amount >= 0) continue;

    const spent = Math.abs(amount);
    const category = (tx.category || 'Não Categorizado').trim();
    if (PENDING_CATEGORIES.has(category) || INCOME_CATEGORY_LABELS.has(category)) continue;

    totalExpenses += spent;
    byCategory[category] = (byCategory[category] || 0) + spent;
  }

  return Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/** Média de despesas (valores negativos) por mês calendário presente no extrato. */
export function computeMonthlyAverageExpense(
  transactions: Array<{ amount: number | string; date?: string }>
): number {
  const byMonth: Record<string, number> = {};

  for (const tx of transactions) {
    const amount =
      typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
    if (!amount || amount >= 0 || !tx.date) continue;

    const monthKey = String(tx.date).slice(0, 7);
    byMonth[monthKey] = (byMonth[monthKey] || 0) + Math.abs(amount);
  }

  const months = Object.keys(byMonth);
  if (months.length === 0) return 0;

  const total = Object.values(byMonth).reduce((sum, v) => sum + v, 0);
  return total / months.length;
}

type TxRecurrenceFields = {
  amount: number | string;
  description?: string;
  clean_memo?: string;
  suggested_identifier?: string;
};

function transactionLabel(tx: TxRecurrenceFields): string {
  return (
    tx.suggested_identifier?.trim() ||
    tx.clean_memo?.trim() ||
    tx.description?.trim() ||
    ''
  );
}

/** Padrões repetidos apenas em saídas (gastos), sem misturar com entradas. */
export function computeExpenseRecurrencePatterns(
  transactions: TxRecurrenceFields[],
  minCount = 3
): string[] {
  const descriptionCounts: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = parseAmount(tx.amount);
    if (!amount || amount >= 0) continue;

    const label = transactionLabel(tx);
    if (!label) continue;
    descriptionCounts[label] = (descriptionCounts[label] || 0) + 1;
  }

  const patterns: string[] = [];
  for (const [desc, count] of Object.entries(descriptionCounts)) {
    if (count >= minCount) {
      patterns.push(`Gastos recorrentes com "${desc}" (${count} ocorrências).`);
    }
  }

  return patterns.sort((a, b) => b.length - a.length);
}

export function formatInsightLabel(entry: unknown): string {
  if (typeof entry === 'string') return entry.trim();
  if (entry && typeof entry === 'object') {
    const row = entry as Record<string, unknown>;
    if (typeof row.label === 'string') return row.label;
    if (typeof row.name === 'string') return row.name;
    if (typeof row.merchant === 'string') return row.merchant;
    if (typeof row.description === 'string') return row.description;
    if (typeof row.pattern === 'string') return row.pattern;
    if (typeof row.text === 'string') return row.text;
  }
  return '';
}

export const DASHBOARD_REFRESH_EVENT = 'tyller:finance-refresh';

export function notifyDashboardRefresh() {
  window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
}
