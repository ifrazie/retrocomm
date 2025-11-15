import express from 'express';
import { wsService } from '../services/WebSocketService.js';
import { userService } from '../services/UserService.js';
import { messageService } from '../services/MessageService.js';

const router = express.Router();

/**
 * GET /api/messages/stream
 * Server-Sent Events endpoint for real-time message delivery
 * Requires sessionId query parameter
 */
router.get('/messages/stream', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  // Verify session and get user
  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Mark user as online
  userService.setUserOnline(user.userId, true);

  // Add connection to WebSocket service
  wsService.addConnection(user.userId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    userId: user.userId,
    username: user.username 
  })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    wsService.removeConnection(user.userId, res);
    userService.setUserOnline(user.userId, false);
    console.log(`User ${user.username} disconnected`);
  });
});

/**
 * POST /api/messages/send
 * Send a message to another user
 */
router.post('/messages/send', (req, res) => {
  const { sessionId, toUsername, content } = req.body;

  // Validate input
  if (!sessionId || !toUsername || !content) {
    return res.status(400).json({ 
      error: 'sessionId, toUsername, and content are required' 
    });
  }

  // Verify sender session
  const sender = userService.getUserBySession(sessionId);
  if (!sender) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // Check if recipient exists
  const recipient = userService.getUserByUsername(toUsername);
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Create and send message
  const message = messageService.sendMessage(sender.userId, toUsername, content);
  
  // Deliver to recipient
  const deliveredMessage = messageService.deliverMessage(message.messageId, recipient.userId);

  // Send real-time notification to recipient if online
  if (wsService.isUserConnected(recipient.userId)) {
    wsService.sendToUser(recipient.userId, {
      type: 'new_message',
      message: {
        messageId: deliveredMessage.messageId,
        from: sender.username,
        fromUserId: sender.userId,
        content: deliveredMessage.content,
        timestamp: deliveredMessage.timestamp,
        status: deliveredMessage.status
      }
    });
  }

  // Return success to sender
  res.json({
    success: true,
    messageId: message.messageId,
    status: deliveredMessage.status,
    timestamp: message.timestamp
  });
});

/**
 * GET /api/messages/inbox
 * Get user's inbox messages
 */
router.get('/messages/inbox', (req, res) => {
  const { sessionId, limit } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const messages = messageService.getUserInbox(user.userId, parseInt(limit) || 50);
  
  res.json({
    messages: messages.map(msg => ({
      messageId: msg.messageId,
      from: msg.fromUserId,
      content: msg.content,
      timestamp: msg.timestamp,
      status: msg.status
    })),
    unreadCount: messageService.getUnreadCount(user.userId)
  });
});

/**
 * POST /api/messages/read
 * Mark message as read
 */
router.post('/messages/read', (req, res) => {
  const { sessionId, messageId } = req.body;

  if (!sessionId || !messageId) {
    return res.status(400).json({ error: 'sessionId and messageId are required' });
  }

  const user = userService.getUserBySession(sessionId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const message = messageService.markAsRead(messageId);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  res.json({ success: true, message });
});

export default router;
