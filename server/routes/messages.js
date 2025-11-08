import express from 'express';
import { addSSEClient, removeSSEClient } from './webhook.js';

const router = express.Router();

/**
 * GET /api/messages/stream
 * Server-Sent Events endpoint for real-time message delivery
 */
router.get('/messages/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  // Add this client to the list of connected clients
  addSSEClient(res);

  // Handle client disconnect
  req.on('close', () => {
    removeSSEClient(res);
  });
});

export default router;
