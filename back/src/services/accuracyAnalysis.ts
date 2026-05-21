import { PoolClient } from 'pg';
import { generateAccuracyReport } from '../utils/groq';

export async function runAccuracyAnalysis(
  client: PoolClient,
  workspaceId: string,
  planId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ ok: boolean; report?: unknown }> {
  const planResult = await client.query(
    'SELECT id, plan_content FROM action_plans WHERE id = $1 AND workspace_id = $2 AND status = $3',
    [planId, workspaceId, 'Ativo']
  );

  if (planResult.rows.length === 0) {
    return { ok: false };
  }

  const plan = planResult.rows[0];

  const transactionsResult = await client.query(
    `SELECT category, amount, date FROM transactions
     WHERE workspace_id = $1 AND date >= $2 AND date <= $3 AND amount < 0
     ORDER BY date ASC`,
    [workspaceId, periodStart, periodEnd]
  );

  if (transactionsResult.rows.length === 0) {
    return { ok: false };
  }

  const accuracyReport = await generateAccuracyReport(
    plan.plan_content,
    transactionsResult.rows,
    periodStart,
    periodEnd
  );

  await client.query(
    `UPDATE action_plans
     SET accuracy_report = $1, status = $2, plan_period_start = $3, plan_period_end = $4
     WHERE id = $5`,
    [accuracyReport, 'Arquivado', periodStart, periodEnd, planId]
  );

  let report: unknown;
  try {
    report = JSON.parse(accuracyReport);
  } catch {
    report = { raw: accuracyReport };
  }

  return { ok: true, report };
}
