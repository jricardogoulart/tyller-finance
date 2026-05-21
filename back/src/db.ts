import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('MANDATORY: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Initializing PostgreSQL database schema...');
    
    // Ensure uuid-ossp extension is enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL DEFAULT '',
        terms_accepted BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure new columns exist for existing databases
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT true;
    `);

    // Create workspaces table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create file_uploads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
        filename VARCHAR(255) NOT NULL,
        transaction_count INT NOT NULL DEFAULT 0,
        status VARCHAR(50) DEFAULT 'success',
        upload_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure file_hash column exists for duplicate detection
    await client.query(`
      ALTER TABLE file_uploads
      ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64);
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50) DEFAULT 'Não Categorizado',
        transaction_hash VARCHAR(64) NOT NULL,
        original_memo TEXT,
        clean_memo TEXT,
        suggested_identifier VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_workspace_transaction UNIQUE(workspace_id, transaction_hash)
      );
    `);

    // Ensure new columns exist for existing databases
    await client.query(`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS original_memo TEXT,
      ADD COLUMN IF NOT EXISTS clean_memo TEXT,
      ADD COLUMN IF NOT EXISTS suggested_identifier VARCHAR(255),
      ADD COLUMN IF NOT EXISTS file_upload_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE;
    `);

    // Create transaction_rules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
        search_token VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority INT DEFAULT 10,
        transaction_type VARCHAR(10) DEFAULT 'ANY',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure origin and subcategory columns exist for existing databases
    await client.query(`
      ALTER TABLE transaction_rules 
      ADD COLUMN IF NOT EXISTS origin VARCHAR(20) DEFAULT 'MANUAL',
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50) DEFAULT 'PADRAO';
    `);

    // Limpar duplicados antes de aplicar o constraint único
    try {
      await client.query(`
        DELETE FROM transaction_rules a USING transaction_rules b
        WHERE a.id < b.id 
          AND a.workspace_id = b.workspace_id 
          AND a.search_token = b.search_token;
      `);
      await client.query(`
        ALTER TABLE transaction_rules
        ADD CONSTRAINT unique_workspace_rule UNIQUE (workspace_id, search_token);
      `);
    } catch (e) {
      // Ignora se o constraint já existia
    }

    // Create ia_context_maps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ia_context_maps (
        workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
        average_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
        top_category VARCHAR(50) NOT NULL DEFAULT 'Indefinido',
        recurrence_patterns JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create action_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS action_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        economy_level VARCHAR(20) NOT NULL CHECK (economy_level IN ('leve', 'moderado', 'intenso')),
        plan_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        target_saving NUMERIC(15,2) NOT NULL DEFAULT 0.00,
        actual_saving NUMERIC(15,2) DEFAULT NULL,
        adherence_score NUMERIC(5,2) DEFAULT NULL
      );
    `);

    await client.query(`
      ALTER TABLE action_plans
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
      ADD COLUMN IF NOT EXISTS accuracy_report TEXT,
      ADD COLUMN IF NOT EXISTS plan_period_start DATE,
      ADD COLUMN IF NOT EXISTS plan_period_end DATE;
    `);

    console.log('PostgreSQL database schema initialized successfully.');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}
