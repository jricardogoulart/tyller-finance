import pg from 'pg';
import dotenv from 'dotenv';
import { categorizeTransactionsBatch, generateContextMap } from './utils/groq';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log('--- START DIAGNOSTIC SCRIPT ---');
  const client = await pool.connect();
  try {
    // 1. Get test user email and workspace
    const userRes = await client.query('SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1');
    if (userRes.rows.length === 0) {
      console.error('No users found in database. Please register a user first.');
      return;
    }
    const userId = userRes.rows[0].id;
    const email = userRes.rows[0].email;
    console.log(`Diagnostic user: ${email} (${userId})`);

    const wsRes = await client.query('SELECT id FROM workspaces WHERE user_id = $1 LIMIT 1', [userId]);
    if (wsRes.rows.length === 0) {
      console.error('No workspace found for user.');
      return;
    }
    const workspaceId = wsRes.rows[0].id;
    console.log(`Workspace ID: ${workspaceId}`);

    // 2. Query pending transactions
    const pendingRes = await client.query(
      "SELECT id, description, amount FROM transactions WHERE workspace_id = $1 AND (category = 'Não Categorizado' OR category IS NULL OR category = '')",
      [workspaceId]
    );
    console.log(`Pending transactions count: ${pendingRes.rows.length}`);
    console.log('Pending transactions:', pendingRes.rows);

    if (pendingRes.rows.length > 0) {
      console.log('Testing categorizeTransactionsBatch...');
      try {
        const mapping = await categorizeTransactionsBatch(pendingRes.rows);
        console.log('Categorization Mapping returned:', mapping);
        
        console.log('Testing saving to database...');
        await client.query('BEGIN');
        for (const [id, category] of Object.entries(mapping)) {
          const cleanCategory = String(category).trim();
          const validCategories = ["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Serviços", "Receita", "Outros"];
          const finalCategory = validCategories.includes(cleanCategory) ? cleanCategory : 'Outros';

          console.log(`Updating tx ${id} to ${finalCategory}...`);
          const updateRes = await client.query(
            'UPDATE transactions SET category = $1 WHERE id = $2 AND workspace_id = $3',
            [finalCategory, id, workspaceId]
          );
          console.log(`Update result rowCount: ${updateRes.rowCount}`);
        }
        await client.query('ROLLBACK'); // Rollback so we don't mutate state permanently during test
        console.log('Transaction database save test: SUCCESS (and rolled back successfully)');
      } catch (err: any) {
        console.error('CRASH in Categorization execution:', err);
      }
    }

    // 3. Test generateContextMap
    console.log('Testing generateContextMap...');
    const allTxRes = await client.query(
      'SELECT amount, category, description, date FROM transactions WHERE workspace_id = $1 ORDER BY date DESC',
      [workspaceId]
    );
    console.log(`All transactions count: ${allTxRes.rows.length}`);
    try {
      const contextData = await generateContextMap(workspaceId, allTxRes.rows);
      console.log('generateContextMap output:', contextData);
      
      console.log('Testing ia_context_maps save...');
      const insertRes = await client.query(
        `INSERT INTO ia_context_maps (workspace_id, average_spend, top_category, recurrence_patterns, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (workspace_id) 
         DO UPDATE SET average_spend = $2, top_category = $3, recurrence_patterns = $4, updated_at = NOW()
         RETURNING *`,
        [workspaceId, contextData.average_spend, contextData.top_category, JSON.stringify(contextData.recurrence_patterns)]
      );
      console.log('ia_context_maps insertion output rows:', insertRes.rows);
    } catch (err: any) {
      console.error('CRASH in Context Map execution:', err);
    }

  } catch (err: any) {
    console.error('Database connection / query crash:', err);
  } finally {
    client.release();
    await pool.end();
    console.log('--- END DIAGNOSTIC SCRIPT ---');
  }
}

run();
