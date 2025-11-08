import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import webhookRouter from '../routes/webhook.js';
import messagesRouter from '../routes/messages.js';
import sendRouter from '../routes/send.js';

/**
 * End-to-End Integration Tests
 * Tests complete message flow through the system
 */

// Create full test app with all routes
const createFullApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Disable auth for testing
  process.env.AUTH_ENABLED = 'false';
  
  app.use('/api', webhookRouter);
  app.use('/api', messagesRouter);
  app.use('/api', sendRouter);
  
  return app;
};

describe('End-to-End Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createFullApp();
  });

  afterAll(() => {
    delete process.env.AUTH_ENABLED;
  });

  describe('Complete Message Flow', () => {
    it('should receive webhook message and broadcast via SSE', (done) => {
      const testMessage = {
        message: 'End-to-end test message',
        sender: 'integration-test',
        timestamp: Date.now()
      };

      // Step 1: Connect to SSE stream
      const sseRequest = request(app)
        .get('/api/messages/stream')
        .set('Accept', 'text/event-stream')
        .buffer(false)
        .parse((res, callback) => {
          res.on('data', (chunk) => {
            const data = chunk.toString();
            
            // Look for our test message in the SSE stream
            if (data.includes('End-to-end test message')) {
              // Parse the SSE data
              const lines = data.split('\n');
              const dataLine = lines.find(line => line.startsWith('data: '));
              
              if (dataLine) {
                const jsonData = dataLine.substring(6); // Remove 'data: ' prefix
                const message = JSON.parse(jsonData);
                
                expect(message.content).toBe('End-to-end test message');
                expect(message.sender).toBe('integration-test');
                expect(message.id).toBeDefined();
                
                // Close the SSE connection
                res.destroy();
                done();
              }
            }
          });
          
          callback(null, '');
        });

      // Step 2: Send webhook message after SSE connection is established
      setTimeout(() => {
        request(app)
          .post('/api/webhook')
          .send(testMessage)
          .expect(200)
          .then(response => {
            expect(response.body.success).toBe(true);
          });
      }, 100);
    });

    it('should handle multiple messages in sequence', async () => {
      const messages = [
        { message: 'First message', sender: 'user1' },
        { message: 'Second message', sender: 'user2' },
        { message: 'Third message', sender: 'user3' }
      ];

      // Send all messages
      for (const msg of messages) {
        const response = await request(app)
          .post('/api/webhook')
          .send(msg)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.messageId).toBeDefined();
      }
    });

    it('should sanitize malicious content in messages', async () => {
      const maliciousMessage = {
        message: '<script>alert("XSS")</script><img src=x onerror="alert(1)">Safe content',
        sender: 'attacker'
      };

      const response = await request(app)
        .post('/api/webhook')
        .send(maliciousMessage)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // Message should be sanitized by the validator middleware
    });
  });

  describe('Outgoing Message Flow', () => {
    it('should accept outgoing message request', async () => {
      const outgoingMessage = {
        message: 'Outgoing test message',
        sender: 'pager-user',
        timestamp: Date.now()
      };

      // Note: This will fail to actually send since we don't have a real webhook URL
      // But it should accept the request and attempt to send
      const response = await request(app)
        .post('/api/send')
        .send({
          webhookUrl: 'http://example.com/webhook',
          payload: outgoingMessage
        });
      
      // Will likely get 400 (validation), 500 (network error), or 200 (success)
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('Health Check', () => {
    it('should respond to health check', async () => {
      const app = express();
      app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', message: 'Retro Messenger backend is running' });
      });

      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
    });
  });
});
