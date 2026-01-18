import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { pool, testConnection } from './db/pool';
import { checkEncryptionKey } from './utils/encryption';
import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import searchRoutes from './routes/search';
import conversationRoutes from './routes/conversations';
import donationRoutes from './routes/donations';
import messageRoutes from './routes/messages';
import feedRoutes from './routes/feed';
import creatorRoutes from './routes/creator';
import channelRoutes from './routes/channels';
import profileRoutes from './routes/profile';
import badgeRoutes from './routes/badges';
import devRoutes from './routes/dev';
import adminRoutes from './routes/admin';

dotenv.config();

// 암호화 키 확인
checkEncryptionKey();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error: any) {
    res.json({ status: 'ok', database: 'disconnected', error: error.message });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/search', searchRoutes);
app.use('/conversations', conversationRoutes);
app.use('/channels', channelRoutes);
app.use('/donations', donationRoutes);
app.use('/messages', messageRoutes);
app.use('/feed', feedRoutes);
app.use('/creator', creatorRoutes);
app.use('/creators', creatorRoutes); // 인기 크리에이터 API용 별칭
app.use('/profile', profileRoutes);
app.use('/badges', badgeRoutes);
app.use('/dev', devRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server even if database connection fails
const server = app.listen(PORT, async () => {
  console.log(`🚀 Melt API server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  
  // Test database connection with improved error handling
  await testConnection();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});
