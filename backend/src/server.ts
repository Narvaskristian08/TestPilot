import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { CONFIG } from './config/constants';
import testRoutes from './routes/tests';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { initTestRunner } from './services/testRunner';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: CONFIG.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/tests', testRoutes);

// Serve artifacts
app.use('/api/artifacts', express.static(CONFIG.ARTIFACTS_PATH));

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('subscribe', (testRunId: string) => {
    socket.join(`test-${testRunId}`);
    console.log(`Client ${socket.id} subscribed to test-${testRunId}`);
  });

  socket.on('unsubscribe', (testRunId: string) => {
    socket.leave(`test-${testRunId}`);
    console.log(`Client ${socket.id} unsubscribed from test-${testRunId}`);
  });
});

// Start server
httpServer.listen(CONFIG.PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║          TestPilot Backend            ║
╚═══════════════════════════════════════╝

🚀 Server running on port ${CONFIG.PORT}
🌍 Environment: ${CONFIG.NODE_ENV}
💾 Database: ${CONFIG.DATABASE_PATH}
📁 Artifacts: ${CONFIG.ARTIFACTS_PATH}
🔌 WebSocket: ${CONFIG.ENABLE_WEBSOCKET ? 'Enabled' : 'Disabled'}

API Endpoints:
  POST   /api/tests
  GET    /api/tests/:id
  GET    /api/tests/:id/results
  GET    /api/tests/:id/artifacts
  POST   /api/tests/:id/cancel
  GET    /api/tests
  DELETE /api/tests/:id

Ready to test websites! 🎭
  `);

  // Initialise the test runner (registers job processor with queue)
  initTestRunner();
});

export default app;
