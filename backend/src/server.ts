import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import crypto from 'crypto';
import { CONFIG } from './config/constants';
import { supabase } from './config/supabase';
import testRoutes from './routes/tests';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { initTestRunner } from './services/testRunner';
import { isArtifactStorageConfigured } from './services/artifactStorage';
import { UserModel } from './models/User';
import { TestRunModel } from './models/TestRun';

if (CONFIG.NODE_ENV === 'production' && !isArtifactStorageConfigured()) {
  throw new Error(
    'Production requires SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ARTIFACT_BUCKET.'
  );
}

const app = express();
app.set('trust proxy', 1);
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
app.use('/api/auth', authRoutes);

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
    subscribeToRun(socket, testRunId).catch((error) => {
      console.error(`[Socket] Failed to authorize subscription for ${socket.id}:`, error);
    });
  });

  socket.on('unsubscribe', (testRunId: string) => {
    socket.leave(`test-${testRunId}`);
    console.log(`Client ${socket.id} unsubscribed from test-${testRunId}`);
  });
});

io.use(async (socket, next) => {
  try {
    const token = typeof socket.handshake.auth?.token === 'string'
      ? socket.handshake.auth.token
      : undefined;

    if (token) {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
      if (error || !supabaseUser) {
        return next(new Error('Unauthorized'));
      }

      const user = await UserModel.findBySupabaseId(supabaseUser.id);
      if (!user) {
        return next(new Error('Unauthorized'));
      }

      socket.data.userId = user.id;
    } else {
      const guestFingerprint = typeof socket.handshake.auth?.guestFingerprint === 'string'
        ? socket.handshake.auth.guestFingerprint
        : undefined;
      socket.data.guestId = generateGuestId(guestFingerprint, getSocketIp(socket));
    }

    return next();
  } catch {
    return next(new Error('Unauthorized'));
  }
});

async function subscribeToRun(socket: Socket, testRunId: string): Promise<void> {
  if (!/^\d+$/.test(testRunId)) return;

  const runId = Number.parseInt(testRunId, 10);
  const testRun = await TestRunModel.findById(runId);
  if (!testRun) return;

  const authorized = socket.data.userId
    ? testRun.user_id === socket.data.userId
    : !testRun.user_id && testRun.guest_id === socket.data.guestId;

  if (!authorized) return;

  socket.join(`test-${runId}`);
  console.log(`Client ${socket.id} subscribed to test-${runId}`);
}

function getSocketIp(socket: Socket): string {
  const forwardedFor = socket.handshake.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return socket.handshake.address || 'unknown';
}

function generateGuestId(fingerprint: string | undefined, ip: string): string {
  const value = fingerprint ? `${fingerprint}-${ip}` : `guest-${ip}`;
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 32);
}

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
