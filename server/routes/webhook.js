import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth.js';
import validateMessageMiddleware from '../middleware/validator.js';

const router = express.Router();

// Store connected SSE clients
let sseClients = [];

/**
 * Broadcast message to all connected SSE clients
 */
export const broadcastMessage = (message) => {
  const data = JSON.stringify(message);
  sseClients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
};

/**
 * Add SSE client to the list
 */
export const addSSEClient = (client) => {
  sseClients.push(client);
};

/**
 * Remove SSE client from the list
 */
export const removeSSEClient = (client) => {
  sseClients = sseClients.filter(c => c !== client);
};

/**
 * POST /api/webhook
 * Accepts incoming webhook payloads and broadcasts to SSE clients
 */
router.post('/webhook', authMiddleware, validateMessageMiddleware, (req, res) => {
  const { message, sender, timestamp, metadata } = req.body;

  // Create message object with unique ID
  const messageObject = {
    id: uuidv4(),
    content: message,
    timestamp: timestamp || Date.now(),
    sender: sender || undefined,
    metadata: metadata || undefined
  };

  // Broadcast to all connected SSE clients
  broadcastMessage(messageObject);

  // Return success response
  res.status(200).json({
    success: true,
    messageId: messageObject.id
  });
});

export default router;
