import express from 'express';
import cors from 'cors';
import webhookRouter from './routes/webhook.js';
import messagesRouter from './routes/messages.js';
import sendRouter from './routes/send.js';
import authRouter from './routes/auth.js';
import { wsService } from './services/WebSocketService.js';
import { userService } from './services/UserService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Retro Messenger backend is running',
    stats: {
      activeConnections: wsService.getTotalConnections(),
      onlineUsers: userService.getOnlineUsers().length,
      totalUsers: userService.getAllUsers().length
    }
  });
});

// Routes
app.use('/api', authRouter);
app.use('/api', messagesRouter);
app.use('/api', webhookRouter);
app.use('/api', sendRouter);

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎃 RETRO MESSENGER SERVER - MULTIUSER MODE 🎃      ║
║                                                       ║
║   Server running on port ${PORT}                         ║
║   Health check: http://localhost:${PORT}/api/health     ║
║                                                       ║
║   Features:                                           ║
║   ✓ Real-time messaging via SSE                      ║
║   ✓ Multi-user support                               ║
║   ✓ Username-based authentication                    ║
║   ✓ Webhook integration                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});
