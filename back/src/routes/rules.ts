import { Router, Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { sanitizeMemo } from '../utils/TransactionClassifier';

const router = Router();

// GET /api/rules - List all workspace rules
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    const rulesResult = await pool.query(
      `SELECT id, search_token, category, priority, transaction_type, origin, subcategory, created_at 
       FROM transaction_rules 
       WHERE workspace_id = $1 
       ORDER BY priority ASC, created_at DESC`,
      [workspaceId]
    );

    return res.status(200).json({ rules: rulesResult.rows });
  } catch (error) {
    console.error('Error fetching transaction rules:', error);
    return res.status(500).json({ error: 'Falha ao buscar regras de transação.' });
  }
});

// POST /api/rules - Create rule and cascade-update existing matching transactions
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { search_token, category, transaction_type, origin } = req.body;

  if (!search_token || !category) {
    return res.status(400).json({ error: 'Os campos search_token e category são obrigatórios.' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const client = await pool.connect();
  try {
    // Get user workspace
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    const sanitizedToken = sanitizeMemo(search_token);
    if (!sanitizedToken) {
      return res.status(400).json({ error: 'Termo de busca inválido após limpeza.' });
    }

    const priority = 10;
    const type = transaction_type || 'ANY';
    const ruleOrigin = origin || 'MANUAL';

    await client.query('BEGIN');

    // Insert or update rules on conflict: se o termo já existir, atualiza para a nova categoria informada
    const result = await client.query(
      `INSERT INTO transaction_rules (workspace_id, search_token, category, priority, transaction_type, origin, subcategory)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (workspace_id, search_token) 
       DO UPDATE SET category = EXCLUDED.category, origin = EXCLUDED.origin
       RETURNING id, search_token, category, origin`,
      [workspaceId, sanitizedToken, category, priority, type, ruleOrigin, ruleOrigin]
    );

    // Efeito Cascata (Recorrência Instantânea)
    // Atualiza TODOS os lançamentos correspondentes neste workspace para alinhar com a nova diretriz de categoria
    const searchPattern = `%${sanitizedToken}%`;
    await client.query(
      `UPDATE transactions 
       SET category = $1 
       WHERE workspace_id = $2 
         AND (clean_memo ILIKE $3 OR description ILIKE $3)`,
      [category, workspaceId, searchPattern]
    );

    await client.query('COMMIT');

    const rule = result.rows[0] || { search_token: sanitizedToken, category, origin: ruleOrigin };

    return res.status(201).json({
      message: 'Regra criada e cascata executada com sucesso.',
      rule
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction rule:', error);
    return res.status(500).json({ error: 'Falha ao criar regra de transação.' });
  } finally {
    client.release();
  }
});

// DELETE /api/rules/:id - Remove rule
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;
    const ruleId = req.params.id;

    const result = await pool.query(
      'DELETE FROM transaction_rules WHERE id = $1 AND workspace_id = $2 RETURNING id',
      [ruleId, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Regra não encontrada ou não pertence a este workspace.' });
    }

    return res.status(200).json({ message: 'Regra excluída com sucesso.' });
  } catch (error) {
    console.error('Error deleting transaction rule:', error);
    return res.status(500).json({ error: 'Falha ao excluir regra.' });
  }
});

// PUT /api/rules/:id/approve - Approve an AI suggestion
router.put('/:id/approve', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;
    const ruleId = req.params.id;

    const result = await pool.query(
      `UPDATE transaction_rules 
       SET origin = 'MANUAL', subcategory = 'MANUAL' 
       WHERE id = $1 AND workspace_id = $2 
       RETURNING id, search_token, category, origin`,
      [ruleId, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Regra não encontrada ou não pertence a este workspace.' });
    }

    return res.status(200).json({ message: 'Regra aprovada com sucesso.', rule: result.rows[0] });
  } catch (error) {
    console.error('Error approving transaction rule:', error);
    return res.status(500).json({ error: 'Falha ao aprovar regra.' });
  }
});

// PUT /api/rules/:id - Edit search token or category
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { search_token, category, transaction_type } = req.body;

  if (!search_token || !category) {
    return res.status(400).json({ error: 'Os campos search_token e category são obrigatórios.' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const client = await pool.connect();
  try {
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;
    const ruleId = req.params.id;
    const type = transaction_type || 'ANY';

    const sanitizedToken = sanitizeMemo(search_token);
    if (!sanitizedToken) {
      return res.status(400).json({ error: 'Termo de busca inválido após limpeza.' });
    }

    await client.query('BEGIN');

    // Verificar se já existe OUTRA regra com o mesmo termo neste workspace para evitar violar o constraint único
    const duplicateCheck = await client.query(
      'SELECT id FROM transaction_rules WHERE workspace_id = $1 AND search_token = $2 AND id != $3 LIMIT 1',
      [workspaceId, sanitizedToken, ruleId]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Já existe outra regra cadastrada com este termo de busca neste workspace.' });
    }

    const result = await client.query(
      `UPDATE transaction_rules 
       SET search_token = $1, category = $2, transaction_type = $3, origin = 'MANUAL'
       WHERE id = $4 AND workspace_id = $5 
       RETURNING id, search_token, category, origin`,
      [sanitizedToken, category, type, ruleId, workspaceId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Regra não encontrada ou não pertence a este workspace.' });
    }

    // Efeito Cascata on edit: atualiza todos os lançamentos que contêm este termo no memo/descrição
    const searchPattern = `%${sanitizedToken}%`;
    await client.query(
      `UPDATE transactions 
       SET category = $1 
       WHERE workspace_id = $2 
         AND (clean_memo ILIKE $3 OR description ILIKE $3)`,
      [category, workspaceId, searchPattern]
    );

    await client.query('COMMIT');

    return res.status(200).json({ message: 'Regra editada com sucesso.', rule: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error editing transaction rule:', error);
    return res.status(500).json({ error: 'Falha ao editar regra.' });
  } finally {
    client.release();
  }
});

export default router;
