import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import transactionsRouter from './routes/transactions';
import aiRouter from './routes/ai';
import rulesRouter from './routes/rules';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS with default settings (allow all origins or configure for front port 5173)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Initialize database schema and start listening
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`[TyllerFinance Backend] Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
