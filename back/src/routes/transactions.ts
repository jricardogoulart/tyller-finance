import { Router, Response } from 'express';
import multer from 'multer';
import ofx from 'ofx-js';
import pdfParse from 'pdf-parse';
import crypto from 'crypto';
import { pool } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { classifyTransaction, ClassificationRule } from '../utils/TransactionClassifier';
import { categorizeTransactionsBatch } from '../utils/groq';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Auxiliar: Recursively search for STMTTRN lists in OFX parsed objects
function findTransactionsInOfx(parsed: any): any[] {
  const transactions: any[] = [];

  function recurse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.STMTTRN) {
      const list = Array.isArray(obj.STMTTRN) ? obj.STMTTRN : [obj.STMTTRN];
      transactions.push(...list);
      return;
    }

    for (const key of Object.keys(obj)) {
      recurse(obj[key]);
    }
  }

  recurse(parsed);
  return transactions;
}

// POST /api/transactions/parse
router.post('/parse', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const { originalname, buffer } = req.file;
  const extension = originalname.split('.').pop()?.toLowerCase();

  // Calculate SHA-256 hash of file content for duplicate detection
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

  try {
    const workspaceResult = await pool.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user?.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }
    const workspaceId = workspaceResult.rows[0].id;

    // Check for duplicate file hash
    const duplicateCheck = await pool.query(
      'SELECT filename FROM file_uploads WHERE workspace_id = $1 AND file_hash = $2 LIMIT 1',
      [workspaceId, fileHash]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(200).json({
        duplicate: true,
        filename: duplicateCheck.rows[0].filename,
        message: 'Este extrato já foi importado anteriormente.'
      });
    }

    const rulesResult = await pool.query(
      'SELECT id, search_token, category, subcategory, priority, transaction_type FROM transaction_rules WHERE workspace_id = $1',
      [workspaceId]
    );
    const userRules: ClassificationRule[] = rulesResult.rows;

    let rawTransactions: Array<{ date: string; amount: number; description: string; category?: string; original_memo?: string; clean_memo?: string; suggested_identifier?: string; }> = [];

    if (extension === 'ofx') {
      const rawString = buffer.toString('utf-8');
      const parsed = await ofx.parse(rawString);
      const ofxTransactions = findTransactionsInOfx(parsed);

      rawTransactions = ofxTransactions.map(tx => {
        // Parse date DTPOSTED (format: YYYYMMDD...)
        const rawDate = tx.DTPOSTED || '';
        let formattedDate = new Date().toISOString().split('T')[0];
        if (rawDate.length >= 8) {
          const year = rawDate.substring(0, 4);
          const month = rawDate.substring(4, 6);
          const day = rawDate.substring(6, 8);
          formattedDate = `${year}-${month}-${day}`;
        }

        let cleanAmount = tx.TRNAMT || '0';
        // Strip thousand separators and use point for decimals if needed, ofx is usually '.' 
        const amount = parseFloat(cleanAmount);

        const rawDescription = (tx.MEMO || tx.NAME || 'Transação sem descrição').trim();
        const classification = classifyTransaction({
          memo: rawDescription,
          amount: amount,
          type: amount < 0 ? 'DEBIT' : 'CREDIT'
        }, userRules);

        return {
          date: formattedDate,
          amount: amount,
          description: classification.clean_memo,
          category: classification.category,
          original_memo: classification.original_memo,
          clean_memo: classification.clean_memo,
          suggested_identifier: classification.suggested_identifier,
        };
      });
    } else if (extension === 'pdf') {
      const data = await pdfParse(buffer);
      const text = data.text;
      const lines = text.split('\n');

      // Standard Brazil date regex DD/MM/YYYY, desc, amount
      const txRegex = /(\d{2})\/(\d{2})\/(\d{4})\s+(.+?)\s+(-?[\d\.,]+)$/;

      for (const line of lines) {
        const cleanLine = line.trim();
        const match = cleanLine.match(txRegex);

        if (match) {
          const [_, day, month, year, description, rawAmount] = match;
          const formattedDate = `${year}-${month}-${day}`;

          let cleanAmount = rawAmount.trim();
          let isNegative = false;

          if (cleanAmount.endsWith('-')) {
            isNegative = true;
            cleanAmount = cleanAmount.slice(0, -1);
          } else if (cleanAmount.startsWith('-')) {
            isNegative = true;
            cleanAmount = cleanAmount.slice(1);
          }

          // Strip thousand separators and use point for decimals
          cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
          const amount = parseFloat(cleanAmount) * (isNegative ? -1 : 1);

          if (!isNaN(amount)) {
            const classification = classifyTransaction({
              memo: description.trim(),
              amount: amount,
              type: amount < 0 ? 'DEBIT' : 'CREDIT'
            }, userRules);

            rawTransactions.push({
              date: formattedDate,
              amount: amount,
              description: classification.clean_memo,
              category: classification.category,
              original_memo: classification.original_memo,
              clean_memo: classification.clean_memo,
              suggested_identifier: classification.suggested_identifier,
            });
          }
        }
      }
    } else {
      return res.status(400).json({ error: 'Formato de arquivo inválido. Apenas OFX e PDF são suportados.' });
    }

    // AI Fallback for PENDENTE_CLASSIFICACAO, Não Categorizado, Outros and empty categories
    const pendingTransactions = rawTransactions.filter(tx => 
      tx.category === 'PENDENTE_CLASSIFICACAO' || 
      tx.category === 'Não Categorizado' || 
      tx.category === 'Outros' || 
      !tx.category
    );

    if (pendingTransactions.length > 0) {
      const itemsToCategorize = pendingTransactions.map((tx, idx) => ({
        id: `temp_${idx}`,
        description: tx.clean_memo || tx.description,
        amount: tx.amount
      }));

      const aiResults = await categorizeTransactionsBatch(itemsToCategorize);

      for (let i = 0; i < pendingTransactions.length; i++) {
        const tx = pendingTransactions[i];
        const newCategory = aiResults[`temp_${i}`];

        if (newCategory && newCategory !== 'Outros' && newCategory !== 'PENDENTE_CLASSIFICACAO') {
          tx.category = newCategory;

          // Auto-learn rule
          await pool.query(
            `INSERT INTO transaction_rules (workspace_id, search_token, category, subcategory, priority, transaction_type, origin)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (workspace_id, search_token) DO NOTHING`,
            [
              workspaceId,
              tx.clean_memo,
              newCategory,
              'AUTO_AI',
              50, // Mid priority for AI learned rules
              tx.amount < 0 ? 'DEBIT' : 'CREDIT',
              'AUTO_AI'
            ]
          );
        }
      }
    }

    // Return unique items mapping temporary hash suggestion
    const responseTransactions = rawTransactions.map(tx => {
      const hashInput = `${req.user?.id}_${tx.date}_${tx.amount.toFixed(2)}_${tx.description}`;
      const tempHash = crypto.createHash('sha256').update(hashInput).digest('hex');
      return {
        ...tx,
        hash: tempHash,
      };
    });

    return res.status(200).json({
      transactions: responseTransactions,
      fileHash: fileHash
    });
  } catch (error: any) {
    console.error('Error parsing file:', error);
    return res.status(500).json({ error: 'Erro ao processar o arquivo. Verifique o formato.' });
  }
});

// POST /api/transactions/import
router.post('/import', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { transactions, filename, fileHash } = req.body;

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'Nenhuma transação enviada para importação.' });
  }

  if (!fileHash || typeof fileHash !== 'string' || fileHash.length !== 64) {
    return res.status(400).json({ error: 'Hash do arquivo é obrigatório e deve ter 64 caracteres.' });
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

    await client.query('BEGIN');

    // Save file upload record with hash first to get uploadId
    const cleanFilename = (filename || 'extrato.ofx').trim();
    const uploadResult = await client.query(
      `INSERT INTO file_uploads (workspace_id, filename, transaction_count, status, file_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [workspaceId, cleanFilename, transactions.length, 'success', fileHash]
    );
    const uploadId = uploadResult.rows[0].id;

    let insertedCount = 0;

    for (const tx of transactions) {
      // Re-verify hash determinism on backend
      const hashInput = `${workspaceId}_${tx.date}_${parseFloat(tx.amount).toFixed(2)}_${tx.description.trim()}`;
      const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

      const result = await client.query(
        `INSERT INTO transactions (workspace_id, description, amount, date, transaction_hash, category, original_memo, clean_memo, suggested_identifier, file_upload_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (workspace_id, transaction_hash) DO NOTHING
         RETURNING id`,
        [workspaceId, tx.description.trim(), tx.amount, tx.date, hash, tx.category, tx.original_memo, tx.clean_memo, tx.suggested_identifier, uploadId]
      );

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    // Update transaction_count with actual inserted count if different
    if (insertedCount !== transactions.length) {
      await client.query(
        `UPDATE file_uploads SET transaction_count = $1 WHERE id = $2`,
        [insertedCount, uploadId]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Importação concluída com sucesso.',
      importedCount: insertedCount,
      skippedCount: transactions.length - insertedCount,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing transactions:', error);
    return res.status(500).json({ error: 'Falha ao salvar as transações no banco de dados.' });
  } finally {
    client.release();
  }
});

// GET /api/transactions
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

    const result = await pool.query(
      'SELECT id, description, amount, date, category, original_memo, clean_memo, suggested_identifier FROM transactions WHERE workspace_id = $1 ORDER BY date DESC, created_at DESC',
      [workspaceId]
    );

    return res.status(200).json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Erro ao listar as transações.' });
  }
});

// GET /api/uploads/history
router.get('/uploads/history', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
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

    const result = await pool.query(
      'SELECT id, filename, transaction_count, status, upload_date FROM file_uploads WHERE workspace_id = $1 ORDER BY upload_date DESC',
      [workspaceId]
    );

    return res.status(200).json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching upload history:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico de uploads.' });
  }
});

// DELETE /api/transactions/uploads/:id - Remove extrato e transações associadas
router.delete('/uploads/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const client = await pool.connect();
  try {
    // 1. Verificar se o upload pertence ao workspace do usuário
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Workspace não encontrado.' });
    }

    const workspaceId = workspaceResult.rows[0].id;

    // 2. Verificar se o upload existe e pertence ao workspace
    const uploadCheck = await client.query(
      'SELECT id, filename FROM file_uploads WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (uploadCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Extrato não encontrado ou sem permissão.' });
    }

    const filename = uploadCheck.rows[0].filename;

    await client.query('BEGIN');

    // 3. Contar transações que serão removidas
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE file_upload_id = $1',
      [id]
    );
    const transactionsCount = parseInt(countResult.rows[0].count) || 0;

    // 4. Deletar transações associadas (explícito, mesmo com CASCADE)
    await client.query(
      'DELETE FROM transactions WHERE file_upload_id = $1',
      [id]
    );

    // 5. Deletar o registro de file_upload
    await client.query(
      'DELETE FROM file_uploads WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Extrato excluído com sucesso.',
      filename: filename,
      deletedTransactions: transactionsCount
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting upload:', error);
    return res.status(500).json({ error: 'Erro ao excluir o extrato.' });
  } finally {
    client.release();
  }
});

export default router;
