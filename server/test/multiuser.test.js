import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRouter from '../routes/auth.js';
import messagesRouter from '../routes/messages.js';
import { userService } from '../services/UserService.js';
import { messageService } from '../services/MessageService.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', authRouter);
  app.use('/api', messagesRouter);
  return app;
};

describe('Multiuser Backend', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    // Clear services before each test
    userService.users.clear();
    userService.usernameIndex.clear();
    userService.sessions.clear();
    messageService.clearAll();
  });

  describe('Authentication', () => {
    it('should login a new user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Alice' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.username).toBe('Alice');
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.isNewUser).toBe(true);
    });

    it('should login an existing user', async () => {
      // First login
      const firstLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Bob' });

      // Second login with same username
      const secondLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Bob' });

      expect(secondLogin.status).toBe(200);
      expect(secondLogin.body.isNewUser).toBe(false);
      expect(secondLogin.body.userId).toBe(firstLogin.body.userId);
    });

    it('should reject empty username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should get list of users', async () => {
      // Create users
      const alice = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Alice' });

      await request(app)
        .post('/api/auth/login')
        .send({ username: 'Bob' });

      // Get user list
      const response = await request(app)
        .get('/api/auth/users')
        .query({ sessionId: alice.body.sessionId });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1); // Bob only (Alice excluded)
      expect(response.body.users[0].username).toBe('Bob');
    });

    it('should verify valid session', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Charlie' });

      const response = await request(app)
        .get('/api/auth/session')
        .query({ sessionId: login.body.sessionId });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('Charlie');
    });

    it('should reject invalid session', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .query({ sessionId: 'invalid-session' });

      expect(response.status).toBe(401);
    });
  });

  describe('Messaging', () => {
    let aliceSession, bobSession;

    beforeEach(async () => {
      // Setup users
      const alice = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Alice' });
      aliceSession = alice.body.sessionId;

      const bob = await request(app)
        .post('/api/auth/login')
        .send({ username: 'Bob' });
      bobSession = bob.body.sessionId;
    });

    it('should send a message', async () => {
      const response = await request(app)
        .post('/api/messages/send')
        .send({
          sessionId: aliceSession,
          toUsername: 'Bob',
          content: 'Hello Bob!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.messageId).toBeDefined();
      expect(response.body.status).toBe('delivered');
    });

    it('should reject message to non-existent user', async () => {
      const response = await request(app)
        .post('/api/messages/send')
        .send({
          sessionId: aliceSession,
          toUsername: 'NonExistent',
          content: 'Hello!'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should get inbox messages', async () => {
      // Send a message
      await request(app)
        .post('/api/messages/send')
        .send({
          sessionId: aliceSession,
          toUsername: 'Bob',
          content: 'Hello Bob!'
        });

      // Get Bob's inbox
      const response = await request(app)
        .get('/api/messages/inbox')
        .query({ sessionId: bobSession });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].content).toBe('Hello Bob!');
    });

    it('should mark message as read', async () => {
      // Send a message
      const sendResponse = await request(app)
        .post('/api/messages/send')
        .send({
          sessionId: aliceSession,
          toUsername: 'Bob',
          content: 'Hello Bob!'
        });

      const messageId = sendResponse.body.messageId;

      // Mark as read
      const response = await request(app)
        .post('/api/messages/read')
        .send({
          sessionId: bobSession,
          messageId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message.status).toBe('read');
    });

    it('should reject sending without authentication', async () => {
      const response = await request(app)
        .post('/api/messages/send')
        .send({
          sessionId: 'invalid',
          toUsername: 'Bob',
          content: 'Hello!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('User Service', () => {
    it('should track online status', () => {
      const result = userService.authenticateUser('TestUser');
      
      userService.setUserOnline(result.userId, true);
      expect(userService.getUserById(result.userId).online).toBe(true);

      userService.setUserOnline(result.userId, false);
      expect(userService.getUserById(result.userId).online).toBe(false);
    });

    it('should get online users', () => {
      const alice = userService.authenticateUser('Alice');
      const bob = userService.authenticateUser('Bob');

      userService.setUserOnline(alice.userId, true);
      userService.setUserOnline(bob.userId, false);

      const onlineUsers = userService.getOnlineUsers();
      expect(onlineUsers).toHaveLength(1);
      expect(onlineUsers[0].username).toBe('Alice');
    });
  });

  describe('Message Service', () => {
    it('should track message status', () => {
      const alice = userService.authenticateUser('Alice');
      const bob = userService.authenticateUser('Bob');

      const message = messageService.sendMessage(alice.userId, 'Bob', 'Hello!');
      expect(message.status).toBe('sent');

      const delivered = messageService.deliverMessage(message.messageId, bob.userId);
      expect(delivered.status).toBe('delivered');

      const read = messageService.markAsRead(message.messageId);
      expect(read.status).toBe('read');
    });

    it('should count unread messages', () => {
      const alice = userService.authenticateUser('Alice');
      const bob = userService.authenticateUser('Bob');

      // Send 3 messages
      const msg1 = messageService.sendMessage(alice.userId, 'Bob', 'Message 1');
      const msg2 = messageService.sendMessage(alice.userId, 'Bob', 'Message 2');
      const msg3 = messageService.sendMessage(alice.userId, 'Bob', 'Message 3');

      messageService.deliverMessage(msg1.messageId, bob.userId);
      messageService.deliverMessage(msg2.messageId, bob.userId);
      messageService.deliverMessage(msg3.messageId, bob.userId);

      expect(messageService.getUnreadCount(bob.userId)).toBe(3);

      // Mark one as read
      messageService.markAsRead(msg1.messageId);
      expect(messageService.getUnreadCount(bob.userId)).toBe(2);
    });
  });
});
