import type { PoolClient } from 'pg';
import {
  classifyTransaction,
  ClassificationRule,
  getPublicDescription,
  getSuggestedIdentifier,
  needsAICategorization,
  normalizeCategory,
  sanitizeMemo,
} from '../utils/TransactionClassifier';
import { categorizeTransactionsBatch } from '../utils/groq';

const PENDING_CATEGORY_FILTER = `(category = 'Não Categorizado' 
  OR category = 'PENDENTE_CLASSIFICACAO' 
  OR category = 'Outros' 
  OR category IS NULL 
  OR category = '')`;

export interface AutoCategorizeResult {
  rulesMatchedCount: number;
  aiCategorizedCount: number;
  categorizedCount: number;
}

/**
 * Cascata: regras (matching com nomes preservados, documentos removidos) → heurística/IA.
 */
export async function autoCategorizeWorkspace(
  client: PoolClient,
  workspaceId: string
): Promise<AutoCategorizeResult> {
  const rulesResult = await client.query(
    `SELECT id, search_token, category, subcategory, priority, transaction_type
     FROM transaction_rules WHERE workspace_id = $1 ORDER BY priority ASC`,
    [workspaceId]
  );

  const userRules: ClassificationRule[] = rulesResult.rows.map((row) => ({
    id: row.id,
    search_token: row.search_token,
    category: row.category,
    subcategory: row.subcategory || '',
    priority: row.priority ?? 10,
    transaction_type: row.transaction_type || 'ANY',
  }));

  const pendingResult = await client.query(
    `SELECT id, description, amount, clean_memo, suggested_identifier, original_memo
     FROM transactions
     WHERE workspace_id = $1 AND ${PENDING_CATEGORY_FILTER}`,
    [workspaceId]
  );

  if (pendingResult.rows.length === 0) {
    return { rulesMatchedCount: 0, aiCategorizedCount: 0, categorizedCount: 0 };
  }

  const ruleUpdates: Array<{ id: string; category: string }> = [];
  const forAi: Array<{ id: string; description: string; amount: number }> = [];
  const memoRefreshes: Array<{ id: string; clean: string; identifier: string }> = [];

  for (const row of pendingResult.rows) {
    if (row.original_memo) {
      const refreshedClean = sanitizeMemo(row.original_memo);
      if (refreshedClean && refreshedClean !== row.clean_memo) {
        const refreshedIdentifier = getSuggestedIdentifier(refreshedClean);
        memoRefreshes.push({ id: row.id, clean: refreshedClean, identifier: refreshedIdentifier });
        row.clean_memo = refreshedClean;
        row.description = refreshedClean;
        row.suggested_identifier = refreshedIdentifier;
      }
    }

    const amount = Number(row.amount);
    const type = amount < 0 ? ('DEBIT' as const) : ('CREDIT' as const);
    const memo = (row.original_memo || row.clean_memo || row.description || '').trim();

    if (memo) {
      const classification = classifyTransaction({ memo, amount, type }, userRules);
      if (!needsAICategorization(classification.category)) {
        ruleUpdates.push({ id: row.id, category: classification.category });
        continue;
      }
    }

    forAi.push({
      id: row.id,
      description: getPublicDescription(row) || memo,
      amount,
    });
  }

  await client.query('BEGIN');
  let rulesMatchedCount = 0;
  let aiCategorizedCount = 0;

  try {
    for (const { id, clean, identifier } of memoRefreshes) {
      await client.query(
        `UPDATE transactions
         SET clean_memo = $1, description = $1, suggested_identifier = $2
         WHERE id = $3 AND workspace_id = $4`,
        [clean, identifier, id, workspaceId]
      );
    }

    for (const { id, category } of ruleUpdates) {
      const updateResult = await client.query(
        'UPDATE transactions SET category = $1 WHERE id = $2 AND workspace_id = $3',
        [normalizeCategory(category), id, workspaceId]
      );
      rulesMatchedCount += updateResult.rowCount ?? 0;
    }

    if (forAi.length > 0) {
      const mapping = await categorizeTransactionsBatch(forAi, {
        userRules: userRules.map((r) => ({
          search_token: r.search_token,
          category: r.category,
        })),
      });

      for (const [id, category] of Object.entries(mapping)) {
        const finalCategory = normalizeCategory(String(category));
        const updateResult = await client.query(
          'UPDATE transactions SET category = $1 WHERE id = $2 AND workspace_id = $3',
          [finalCategory, id, workspaceId]
        );
        aiCategorizedCount += updateResult.rowCount ?? 0;
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  return {
    rulesMatchedCount,
    aiCategorizedCount,
    categorizedCount: rulesMatchedCount + aiCategorizedCount,
  };
}
