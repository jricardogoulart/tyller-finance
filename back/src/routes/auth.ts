import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production';

// POST /api/auth/signup
router.post('/signup', async (req: any, res: Response): Promise<any> => {
  const { email, password, name, termsAccepted } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (termsAccepted !== true) {
    return res.status(400).json({ error: 'You must accept the terms and conditions.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, name, terms_accepted) VALUES ($1, $2, $3, $4) RETURNING id, email, name, terms_accepted, created_at',
      [email, passwordHash, name || '', true]
    );
    const user = userResult.rows[0];

    // Create default workspace
    const workspaceResult = await client.query(
      'INSERT INTO workspaces (user_id, name) VALUES ($1, $2) RETURNING id, name',
      [user.id, 'Meu Workspace']
    );
    const workspace = workspaceResult.rows[0];

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, terms_accepted: user.terms_accepted },
      workspace,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in signup:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req: any, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Get user workspace
    const workspaceResult = await pool.query('SELECT id, name FROM workspaces WHERE user_id = $1 LIMIT 1', [user.id]);
    const workspace = workspaceResult.rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, terms_accepted: user.terms_accepted },
      workspace,
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me (Restore session on mount)
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const userResult = await pool.query('SELECT id, email, name, terms_accepted FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userResult.rows[0];

    const workspaceResult = await pool.query('SELECT id, name FROM workspaces WHERE user_id = $1 LIMIT 1', [user.id]);
    const workspace = workspaceResult.rows[0];

    return res.status(200).json({
      user,
      workspace,
    });
  } catch (error) {
    console.error('Error restoring session:', error);
    return res.status(500).json({ error: 'Internal server error restoring session.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { name, currentPassword, newPassword, termsAccepted } = req.body;
  const userId = req.user.id;

  if (name === undefined && !newPassword && termsAccepted === undefined) {
    return res.status(400).json({ error: 'No fields to update provided.' });
  }

  try {
    // Get current user data
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userResult.rows[0];

    let updatedName = user.name;
    if (name !== undefined) {
      updatedName = name.trim();
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(newPassword, salt);
    }

    let updatedTerms = user.terms_accepted;
    if (termsAccepted !== undefined) {
      updatedTerms = Boolean(termsAccepted);
    }

    // Update user in DB
    const updateResult = await pool.query(
      'UPDATE users SET name = $1, password_hash = $2, terms_accepted = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, name, terms_accepted',
      [updatedName, passwordHash, updatedTerms, userId]
    );
    const updatedUser = updateResult.rows[0];

    return res.status(200).json({
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error updating profile.' });
  }
});

// GET /api/auth/export
router.get('/export', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const userId = req.user.id;
    const client = await pool.connect();
    
    try {
      // Get User
      const userResult = await client.query('SELECT id, email, name, terms_accepted, created_at FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Get Workspace
      const workspaceResult = await client.query('SELECT * FROM workspaces WHERE user_id = $1 LIMIT 1', [userId]);
      const workspace = workspaceResult.rows[0];

      let transactions = [];
      let rules = [];
      let contextMap = null;
      let fileUploads = [];

      if (workspace) {
        const workspaceId = workspace.id;

        // Get Transactions
        const txResult = await client.query('SELECT * FROM transactions WHERE workspace_id = $1 ORDER BY date DESC', [workspaceId]);
        transactions = txResult.rows;

        // Get Rules
        const rulesResult = await client.query('SELECT * FROM transaction_rules WHERE workspace_id = $1', [workspaceId]);
        rules = rulesResult.rows;

        // Get Context Map
        const ctxResult = await client.query('SELECT * FROM ia_context_maps WHERE workspace_id = $1', [workspaceId]);
        contextMap = ctxResult.rows[0] || null;

        // Get File Uploads
        const filesResult = await client.query('SELECT * FROM file_uploads WHERE workspace_id = $1 ORDER BY upload_date DESC', [workspaceId]);
        fileUploads = filesResult.rows;
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        user,
        workspace,
        ia_context_map: contextMap,
        file_uploads: fileUploads,
        transaction_rules: rules,
        transactions,
      };

      return res.status(200).json(exportData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({ error: 'Internal server error during data export.' });
  }
});

// DELETE /api/auth/account
router.delete('/account', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const userId = req.user.id;
    // Deleção em cascata (ON DELETE CASCADE no banco apagará os workspaces e todos os dados associados)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.status(200).json({ message: 'Account and all associated data permanently deleted.' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json({ error: 'Internal server error during account deletion.' });
  }
});

export default router;
