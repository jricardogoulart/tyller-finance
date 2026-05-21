import type { Pool, PoolClient } from 'pg';

export type EconomyLevel = 'none' | 'leve' | 'moderado' | 'intenso';

export interface CashFlowProjection {
  economyLevel: EconomyLevel;
  economyFactor: number;
  reductionPercent: number;
  currentBalance: number;
  dailyExpenseAverage: number;
  projectedEndBalance: number;
  estimatedSavings30d: number;
  historicalPoints: Array<{ date: string; balance: number }>;
  projectionPoints: Array<{ date: string; balance: number; projected: boolean }>;
}

function economyFactorForLevel(level: string): number {
  if (level === 'leve') return 0.9;
  if (level === 'moderado') return 0.75;
  if (level === 'intenso') return 0.5;
  return 1.0;
}

function reductionPercentForLevel(level: string): number {
  if (level === 'leve') return 10;
  if (level === 'moderado') return 25;
  if (level === 'intenso') return 50;
  return 0;
}

export async function computeCashFlowProjection(
  db: Pool | PoolClient,
  workspaceId: string,
  economyLevel: EconomyLevel = 'none'
): Promise<CashFlowProjection> {
  const economyFactor = economyFactorForLevel(economyLevel);

  const txResult = await db.query(
    'SELECT amount, date FROM transactions WHERE workspace_id = $1 ORDER BY date ASC',
    [workspaceId]
  );
  const transactions = txResult.rows;

  let currentBalance = 0;
  const historicalPoints: Array<{ date: string; balance: number }> = [];

  for (const tx of transactions) {
    currentBalance += Number(tx.amount);
    const formattedDate =
      tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date);
    historicalPoints.push({
      date: formattedDate.slice(5, 10).replace('-', '/'),
      balance: Number(currentBalance.toFixed(2)),
    });
  }

  const expenses = transactions.filter((tx) => Number(tx.amount) < 0);
  let dailyExpenseAverage = 0;

  if (expenses.length > 0) {
    const dates = transactions.map((tx) =>
      tx.date instanceof Date ? tx.date.getTime() : new Date(tx.date).getTime()
    );
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
    const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
    dailyExpenseAverage = totalExpenses / daysDiff;
  }

  const projectionPoints: Array<{ date: string; balance: number; projected: boolean }> = [];
  const today = new Date();
  let tempBalance = currentBalance;

  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    const formattedDate = futureDate.toISOString().split('T')[0].slice(5, 10).replace('-', '/');

    tempBalance -= dailyExpenseAverage * economyFactor;

    projectionPoints.push({
      date: formattedDate,
      balance: Number(tempBalance.toFixed(2)),
      projected: true,
    });
  }

  const projectedEndBalance =
    projectionPoints.length > 0
      ? projectionPoints[projectionPoints.length - 1].balance
      : currentBalance;

  const baselineEnd = currentBalance - dailyExpenseAverage * 30;
  const estimatedSavings30d = Number((projectedEndBalance - baselineEnd).toFixed(2));

  return {
    economyLevel,
    economyFactor,
    reductionPercent: reductionPercentForLevel(economyLevel),
    currentBalance: Number(currentBalance.toFixed(2)),
    dailyExpenseAverage: Number(dailyExpenseAverage.toFixed(2)),
    projectedEndBalance,
    estimatedSavings30d,
    historicalPoints: historicalPoints.slice(-15),
    projectionPoints,
  };
}
