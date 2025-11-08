import express from 'express';
import cors from 'cors';
import webhookRouter from './routes/webhook.js';
import messagesRouter from './routes/messages.js';
import sendRouter from './routes/send.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Retro Messenger backend is running' });
});

// Routes
app.use('/api', webhookRouter);
app.use('/api', messagesRouter);
app.use('/api', sendRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
