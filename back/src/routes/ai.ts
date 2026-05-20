import { Router, Response } from 'express';
import { pool } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { categorizeTransactionsBatch, generateContextMap, generateAIActionPlan } from '../utils/groq';

const router = Router();

// POST /api/ai/categorize - Categoriza transações sem categoria em lote
router.post('/categorize', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const client = await pool.connect();
  try {
    // 1. Obter workspace do usuário
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    // 2. Buscar transações com categoria padrão ou vazia (itens indefinidos)
    const pendingResult = await client.query(
      `SELECT id, description, amount FROM transactions 
       WHERE workspace_id = $1 
         AND (category = 'Não Categorizado' 
              OR category = 'PENDENTE_CLASSIFICACAO' 
              OR category = 'Outros' 
              OR category IS NULL 
              OR category = '')`,
      [workspaceId]
    );

    const pendingTransactions = pendingResult.rows;

    if (pendingTransactions.length === 0) {
      return res.status(200).json({
        message: 'Nenhuma transação pendente de categorização.',
        categorizedCount: 0,
      });
    }

    // 3. Chamar a IA / Classificador em lote
    const categorizationMapping = await categorizeTransactionsBatch(pendingTransactions);

    // 4. Salvar as categorias sugeridas no banco Postgres
    await client.query('BEGIN');
    let updatedCount = 0;

    for (const [id, category] of Object.entries(categorizationMapping)) {
      // Garantir categoria limpa e dentro das permitidas ou usar Outros
      const cleanCategory = String(category).trim();
      const validCategories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Serviços", "Receita", "Seguro", "Outros"];
      const finalCategory = validCategories.includes(cleanCategory) ? cleanCategory : 'Outros';

      const updateResult = await client.query(
        'UPDATE transactions SET category = $1 WHERE id = $2 AND workspace_id = $3',
        [finalCategory, id, workspaceId]
      );
      if (updateResult.rowCount && updateResult.rowCount > 0) {
        updatedCount++;
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Categorização por IA concluída com sucesso.',
      categorizedCount: updatedCount,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[TyllerFinance Backend] Error in /api/ai/categorize:', error);
    return res.status(500).json({ error: 'Falha ao processar categorização por IA.' });
  } finally {
    client.release();
  }
});

// POST /api/ai/recalculate - Recalcula o IA Context Map do usuário
router.post('/recalculate', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const client = await pool.connect();
  try {
    // 1. Obter workspace do usuário
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    // 2. Obter todas as transações para análise
    const transactionsResult = await client.query(
      'SELECT amount, category, description, date FROM transactions WHERE workspace_id = $1 ORDER BY date DESC',
      [workspaceId]
    );

    const transactions = transactionsResult.rows;

    if (transactions.length === 0) {
      // Inicializar com dados default limpos se não tiver transações
      const defaultMap = {
        workspace_id: workspaceId,
        average_spend: 0,
        top_category: 'Nenhuma',
        recurrence_patterns: JSON.stringify(['Aguardando importação de extratos bancários.']),
        updated_at: new Date()
      };

      await client.query(
        `INSERT INTO ia_context_maps (workspace_id, average_spend, top_category, recurrence_patterns, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (workspace_id) 
         DO UPDATE SET average_spend = $2, top_category = $3, recurrence_patterns = $4, updated_at = NOW()`,
        [defaultMap.workspace_id, defaultMap.average_spend, defaultMap.top_category, defaultMap.recurrence_patterns]
      );

      return res.status(200).json({
        message: 'Context Map inicializado padrão (vazio).',
        contextMap: {
          average_spend: 0,
          top_category: 'Nenhuma',
          recurrence_patterns: ['Aguardando importação de extratos bancários.'],
        }
      });
    }

    // 3. Processar análise por IA / Estatística local
    const contextMapData = await generateContextMap(workspaceId, transactions);

    // 4. Salvar ou atualizar na tabela ia_context_maps do Postgres
    await client.query(
      `INSERT INTO ia_context_maps (workspace_id, average_spend, top_category, recurrence_patterns, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (workspace_id) 
       DO UPDATE SET average_spend = $2, top_category = $3, recurrence_patterns = $4, updated_at = NOW()`,
      [workspaceId, contextMapData.average_spend, contextMapData.top_category, JSON.stringify(contextMapData.recurrence_patterns)]
    );

    return res.status(200).json({
      message: 'IA Context Map recalculado com sucesso.',
      contextMap: contextMapData
    });
  } catch (error) {
    console.error('[TyllerFinance Backend] Error in /api/ai/recalculate:', error);
    return res.status(500).json({ error: 'Erro ao recalcular o Context Map.' });
  } finally {
    client.release();
  }
});

// GET /api/ai/context-map - Busca o IA Context Map ativo do usuário
router.get('/context-map', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    // 1. Obter workspace do usuário
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    // 2. Buscar no banco
    const mapResult = await pool.query(
      'SELECT average_spend, top_category, recurrence_patterns FROM ia_context_maps WHERE workspace_id = $1 LIMIT 1',
      [workspaceId]
    );

    if (mapResult.rows.length === 0) {
      // Se não existe Context Map, retorna inicializado vazio padrão
      return res.status(200).json({
        contextMap: {
          average_spend: 0,
          top_category: 'Nenhuma',
          recurrence_patterns: ['Aguardando a primeira otimização de IA.'],
        }
      });
    }

    const row = mapResult.rows[0];
    
    // Parse recurrence_patterns array
    let recurrencePatterns: string[] = [];
    try {
      recurrencePatterns = typeof row.recurrence_patterns === 'string' 
        ? JSON.parse(row.recurrence_patterns) 
        : row.recurrence_patterns;
    } catch {
      recurrencePatterns = ['Aguardando a primeira otimização de IA.'];
    }

    return res.status(200).json({
      contextMap: {
        average_spend: parseFloat(row.average_spend) || 0,
        top_category: row.top_category || 'Nenhuma',
        recurrence_patterns: recurrencePatterns,
      }
    });
  } catch (error) {
    console.error('[TyllerFinance Backend] Error in GET /api/ai/context-map:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do Context Map.' });
  }
});

// PUT /api/ai/transactions/:id/category - Edição manual de categorias de transações
router.put('/transactions/:id/category', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'A categoria deve ser fornecida como uma string válida.' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  try {
    // 1. Obter workspace do usuário
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    // 2. Validar categoria fornecida (qualquer string de até 50 caracteres para suportar categorias customizadas e Seguro)
    if (category.length > 50) {
      return res.status(400).json({ error: 'O nome da categoria deve ter no máximo 50 caracteres.' });
    }

    // 3. Atualizar no Postgres
    const result = await pool.query(
      'UPDATE transactions SET category = $1 WHERE id = $2 AND workspace_id = $3 RETURNING id, category',
      [category, id, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada ou sem acesso autorizado.' });
    }

    return res.status(200).json({
      message: 'Categoria atualizada com sucesso.',
      transaction: result.rows[0],
    });
  } catch (error) {
    console.error('[TyllerFinance Backend] Error updating manual category:', error);
    return res.status(500).json({ error: 'Erro ao atualizar a categoria manualmente.' });
  }
});

// GET /api/ai/projections - Retorna o histórico de saldo e a projeção para 30 dias
router.get('/projections', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });
  
  const economyLevel = (req.query.economy as string) || 'none';
  let economyFactor = 1.0;
  if (economyLevel === 'leve') economyFactor = 0.90;
  else if (economyLevel === 'moderado') economyFactor = 0.75;
  else if (economyLevel === 'intenso') economyFactor = 0.50;

  try {
    // 1. Obter workspace
    const wsResult = await pool.query('SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1', [req.user.id]);
    if (wsResult.rows.length === 0) return res.status(400).json({ error: 'Workspace não encontrado.' });
    const workspaceId = wsResult.rows[0].id;

    // 2. Buscar todas as transações em ordem cronológica para montar o histórico de saldo
    const txResult = await pool.query(
      'SELECT amount, date FROM transactions WHERE workspace_id = $1 ORDER BY date ASC',
      [workspaceId]
    );
    const transactions = txResult.rows;

    // 3. Calcular saldo atual acumulado e preparar dados históricos
    let currentBalance = 0;
    const historicalPoints: Array<{ date: string; balance: number }> = [];

    for (const tx of transactions) {
      currentBalance += Number(tx.amount);
      const formattedDate = tx.date instanceof Date ? tx.date.toISOString().split('T')[0] : String(tx.date);
      historicalPoints.push({
        date: formattedDate.slice(5, 10).replace('-', '/'), // MM/DD
        balance: Number(currentBalance.toFixed(2))
      });
    }

    // 4. Calcular média diária de despesas (valores negativos)
    const expenses = transactions.filter(tx => Number(tx.amount) < 0);
    let dailyExpenseAverage = 0;

    if (expenses.length > 0) {
      const dates = transactions.map(tx => tx.date instanceof Date ? tx.date.getTime() : new Date(tx.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
      
      const totalExpenses = expenses.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      dailyExpenseAverage = totalExpenses / daysDiff;
    }

    // 5. Projetar próximos 30 dias a partir de hoje
    const projectionPoints: Array<{ date: string; balance: number; projected: boolean }> = [];
    const today = new Date();
    let tempBalance = currentBalance;

    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const formattedDate = futureDate.toISOString().split('T')[0].slice(5, 10).replace('-', '/'); // MM/DD

      // Deduz gasto diário ajustado pela meta de economia
      tempBalance -= (dailyExpenseAverage * economyFactor);

      projectionPoints.push({
        date: formattedDate,
        balance: Number(tempBalance.toFixed(2)),
        projected: true
      });
    }

    return res.status(200).json({
      currentBalance: Number(currentBalance.toFixed(2)),
      dailyExpenseAverage: Number(dailyExpenseAverage.toFixed(2)),
      historicalPoints: historicalPoints.slice(-15), // Últimos 15 pontos históricos
      projectionPoints: projectionPoints
    });
  } catch (error) {
    console.error('[TyllerFinance Backend] Error in GET /api/ai/projections:', error);
    return res.status(500).json({ error: 'Erro ao calcular projeções de saldo.' });
  }
});

// POST /api/ai/action-plan - Gera o plano de ação tático por IA
router.post('/action-plan', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { economyLevel } = req.body;
  if (!economyLevel || !['leve', 'moderado', 'intenso'].includes(economyLevel)) {
    return res.status(400).json({ error: 'Nível de economia inválido.' });
  }

  if (!req.user) return res.status(401).json({ error: 'Não autorizado.' });

  try {
    // 1. Buscar workspace e dados do IA Context Map
    const wsResult = await pool.query('SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1', [req.user.id]);
    if (wsResult.rows.length === 0) return res.status(400).json({ error: 'Workspace não encontrado.' });
    const workspaceId = wsResult.rows[0].id;

    const mapResult = await pool.query(
      'SELECT average_spend, top_category, recurrence_patterns FROM ia_context_maps WHERE workspace_id = $1 LIMIT 1',
      [workspaceId]
    );

    const contextMap = mapResult.rows[0] || {
      average_spend: 0,
      top_category: 'Nenhuma',
      recurrence_patterns: '[]'
    };

    // 2. Chamar geração de plano de ação
    const planMarkdown = await generateAIActionPlan(economyLevel, contextMap);

    return res.status(200).json({ plan: planMarkdown });
  } catch (error) {
    console.error('[TyllerFinance Backend] Error in /api/ai/action-plan:', error);
    return res.status(500).json({ error: 'Erro ao gerar o plano de ação por IA.' });
  }
});

export default router;
