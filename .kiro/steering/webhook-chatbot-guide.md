# Technical Implementation Guide: Webhooks & Chatbots in Retro Messenger

## Architecture Overview

This guide provides detailed technical specifications for implementing webhook integration and chatbot functionality in the Retro Messenger application for your Devpost Kiroween submission.

---

## Part 1: Webhook Integration Architecture

### 1.1 Webhook Concept in Retro Messenger

Webhooks are the backbone of modern event-driven architecture. In Retro Messenger, webhooks simulate real-time communication:

- **Event Generation**: User sends message
- **HTTP Request**: App triggers simulated webhook (internally)
- **Processing**: Message is processed by chatbot/delivery system
- **Status Update**: UI reflects transmission progress
- **Response Webhook**: Return event triggers UI update

### 1.2 Webhook Simulator Implementation

Since this is a frontend-only application, implement a webhook simulator that mimics real webhook behavior:

```javascript
// WebhookSimulator.js
class WebhookSimulator {
  constructor() {
    this.webhookQueue = [];
    this.retryAttempts = 3;
    this.timeout = 5000; // milliseconds
  }

  // Simulate webhook POST request
  async sendWebhook(payload, endpoint = 'https://api.retromessenger.local/messages') {
    const webhook = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'pending',
      payload: payload,
      endpoint: endpoint,
      attempts: 0
    };

    this.webhookQueue.push(webhook);
    return this.executeWebhook(webhook);
  }

  // Execute webhook with retry logic
  async executeWebhook(webhook) {
    while (webhook.attempts < this.retryAttempts) {
      try {
        webhook.status = 'sending';
        webhook.attempts += 1;

        // Simulate network latency
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 2000 + 1000)
        );

        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
          throw new Error('Webhook delivery failed');
        }

        webhook.status = 'delivered';
        webhook.deliveredAt = new Date().toISOString();
        
        return {
          success: true,
          webhook: webhook,
          message: 'Webhook delivered successfully'
        };

      } catch (error) {
        webhook.status = 'failed';
        
        if (webhook.attempts < this.retryAttempts) {
          webhook.status = 'retrying';
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, webhook.attempts) * 1000)
          );
        }
      }
    }

    webhook.status = 'failed';
    return {
      success: false,
      webhook: webhook,
      message: 'Webhook delivery failed after retries'
    };
  }

  // Get webhook status for UI
  getWebhookStatus(webhookId) {
    return this.webhookQueue.find(w => w.id === webhookId);
  }

  // Get all webhooks
  getAllWebhooks() {
    return this.webhookQueue;
  }
}

export default WebhookSimulator;
```

### 1.3 Webhook Integration in React Components

```javascript
// MessageSender.jsx
import React, { useState } from 'react';
import WebhookSimulator from './WebhookSimulator';

function MessageSender({ onMessageSent, onWebhookUpdate }) {
  const [message, setMessage] = useState('');
  const [webhookStatus, setWebhookStatus] = useState('idle');
  const [webhookId, setWebhookId] = useState(null);
  const webhookSim = new WebhookSimulator();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const messagePayload = {
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    // Show sending status
    setWebhookStatus('sending');
    
    try {
      // Send via webhook simulator
      const result = await webhookSim.sendWebhook(messagePayload);
      
      setWebhookId(result.webhook.id);
      onWebhookUpdate(result.webhook);

      if (result.success) {
        setWebhookStatus('delivered');
        onMessageSent({
          ...messagePayload,
          status: 'delivered',
          webhookId: result.webhook.id
        });

        // Clear input after delay
        setTimeout(() => {
          setMessage('');
          setWebhookStatus('idle');
        }, 1000);
      }
    } catch (error) {
      setWebhookStatus('failed');
      console.error('Webhook failed:', error);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="message-sender">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        className="message-input"
        disabled={webhookStatus === 'sending'}
      />
      
      <button 
        type="submit"
        className={`send-button send-${webhookStatus}`}
        disabled={webhookStatus === 'sending'}
      >
        {webhookStatus === 'sending' ? '⏳ SENDING...' : 'SEND'}
      </button>

      {webhookStatus !== 'idle' && (
        <div className="webhook-status">
          <span className={`status-indicator ${webhookStatus}`}></span>
          <span className="status-text">
            {webhookStatus === 'sending' && 'Transmitting...'}
            {webhookStatus === 'delivered' && 'Delivered'}
            {webhookStatus === 'failed' && 'Failed - Retrying'}
          </span>
        </div>
      )}
    </form>
  );
}

export default MessageSender;
```

### 1.4 Webhook Status Visualization

```css
/* RetroWebhookIndicator.css */

.webhook-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: #1a1a2e;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.modem-animation {
  width: 20px;
  height: 20px;
  border: 2px solid #00ff41;
  border-radius: 50%;
  animation: modem-pulse 0.8s infinite;
}

@keyframes modem-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 65, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 65, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 65, 0);
  }
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.sending {
  background-color: #ffff00;
  animation: blink 0.5s infinite;
}

.status-indicator.delivered {
  background-color: #00ff41;
}

.status-indicator.failed {
  background-color: #ff0000;
  animation: blink 0.3s infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}
```

---

## Part 2: Chatbot Integration

### 2.1 Chatbot Engine Architecture

```javascript
// ChatbotEngine.js
class ChatbotEngine {
  constructor() {
    this.commandPatterns = {
      time: /\b(what\s+time|what's\s+the\s+time|current\s+time)\b/i,
      status: /\b(status|battery|signal)\b/i,
      help: /\b(help|commands|what\s+can\s+you\s+do)\b/i,
      weather: /\b(weather|temperature|humidity)\b/i,
      info: /\b(info|about|version)\b/i
    };

    this.conversationHistory = [];
    this.responseDelay = 1500; // milliseconds for typing effect
  }

  // Parse user input and generate response
  async processMessage(userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, this.responseDelay));

    let response = this.generateResponse(userMessage);

    this.conversationHistory.push({
      role: 'chatbot',
      content: response,
      timestamp: new Date().toISOString()
    });

    return response;
  }

  // Generate contextual response
  generateResponse(userMessage) {
    const input = userMessage.toLowerCase().trim();

    // Time command
    if (this.commandPatterns.time.test(input)) {
      const now = new Date();
      return `[SYSTEM] CURRENT TIME: ${now.toLocaleTimeString('en-US', { 
        hour12: false 
      })}`;
    }

    // Status command
    if (this.commandPatterns.status.test(input)) {
      return `[SYSTEM] BATTERY: ${Math.floor(Math.random() * 30) + 70}% | SIGNAL: ${Math.floor(Math.random() * 5) + 1}/5 | MEMORY: ${Math.floor(Math.random() * 40) + 60}%`;
    }

    // Help command
    if (this.commandPatterns.help.test(input)) {
      return `[SYSTEM] AVAILABLE COMMANDS:
TIME - Display current time
STATUS - Show device status
WEATHER - Display weather info
INFO - About this device
HELP - Show this message`;
    }

    // Weather command
    if (this.commandPatterns.weather.test(input)) {
      const temps = ['72', '68', '75', '70'];
      const humidity = ['45', '52', '38', '60'];
      return `[SYSTEM] WEATHER: ${temps[Math.floor(Math.random() * temps.length)]}°F | HUMIDITY: ${humidity[Math.floor(Math.random() * humidity.length)]}%`;
    }

    // Info command
    if (this.commandPatterns.info.test(input)) {
      return `[SYSTEM] RETRO MESSENGER v1.0 | DEVICE: CLASSIC PAGER | YEAR: 1994 | MEMORY: 256KB`;
    }

    // Default contextual response
    return this.generateContextualResponse(userMessage);
  }

  // Generate contextual response based on conversation
  generateContextualResponse(userMessage) {
    const responses = [
      "MESSAGE RECEIVED. AWAITING YOUR COMMAND.",
      "UNDERSTOOD. PROCESSING REQUEST...",
      "CONFIRMED. STANDING BY.",
      "ROGER THAT. READY FOR NEXT INPUT.",
      "ACKNOWLEDGED. WHAT ELSE?",
      "TRANSMITTING ACKNOWLEDGMENT...",
      "MESSAGE LOGGED. CONTINUING...",
      "COPY THAT. READY TO PROCEED."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // Clear history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get typing indicator
  getTypingIndicator() {
    const indicators = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    return indicators[Math.floor(Math.random() * indicators.length)];
  }
}

export default ChatbotEngine;
```

### 2.2 React Component for Chatbot

```javascript
// ChatbotComponent.jsx
import React, { useState, useEffect } from 'react';
import ChatbotEngine from './ChatbotEngine';

function ChatbotComponent({ onBotResponse }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatbot] = useState(new ChatbotEngine());

  const handleUserMessage = async (userMessage) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    try {
      // Get chatbot response
      const botResponse = await chatbot.processMessage(userMessage);

      // Add bot response
      setMessages(prev => [...prev, {
        role: 'chatbot',
        content: botResponse,
        timestamp: new Date()
      }]);

      onBotResponse(botResponse);

    } catch (error) {
      console.error('Chatbot error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-history">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <span className="prefix">
              {msg.role === 'chatbot' ? '> BOT: ' : '> YOU: '}
            </span>
            <span className="content">{msg.content}</span>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">▁ ▂ ▃ ▄</div>}
      </div>

      <input
        type="text"
        placeholder="Command or message..."
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            handleUserMessage(e.target.value);
            e.target.value = '';
          }
        }}
        disabled={isTyping}
        className="chatbot-input"
      />
    </div>
  );
}

export default ChatbotComponent;
```

### 2.3 Terminal-Style Styling

```css
/* ChatbotTerminal.css */

.chatbot-container {
  background-color: #000000;
  color: #00ff41;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 3px solid #00ff41;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.chat-history {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.message {
  margin-bottom: 10px;
  font-size: 12px;
  letter-spacing: 1px;
}

.message-chatbot {
  color: #00ff41;
}

.message-user {
  color: #ffff00;
}

.prefix {
  font-weight: bold;
  margin-right: 5px;
}

.typing-indicator {
  color: #00ff41;
  animation: typing 0.8s infinite;
}

@keyframes typing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chatbot-input {
  width: 100%;
  background-color: #000000;
  color: #00ff41;
  border: 2px solid #00ff41;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.chatbot-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

/* Scrollbar styling */
.chat-history::-webkit-scrollbar {
  width: 8px;
}

.chat-history::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #00ff41;
  border-radius: 4px;
}
```

---

## Part 3: Integration with AWS Services (Future Implementation)

### 3.1 Lambda Function for Webhook Handler

For production deployment, connect to actual AWS Lambda:

```javascript
// lambda-handler.js (Python example for AWS Lambda)

import json
import boto3
import hmac
import hashlib

def lambda_handler(event, context):
    """
    Handle webhook from Retro Messenger
    """
    
    # Verify webhook signature
    secret = os.environ['WEBHOOK_SECRET']
    signature = event['headers'].get('x-webhook-signature')
    
    if not verify_signature(event['body'], signature, secret):
        return {
            'statusCode': 401,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    # Parse message
    body = json.loads(event['body'])
    message = body['content']
    
    # Process message (send to DynamoDB, trigger SNS, etc.)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('RetroMessengerMessages')
    
    table.put_item(
        Item={
            'messageId': body['id'],
            'sender': body['sender'],
            'content': message,
            'timestamp': body['timestamp'],
            'status': 'received'
        }
    )
    
    # Generate AI response
    response_text = generate_bot_response(message)
    
    # Publish to SNS for real-time delivery
    sns = boto3.client('sns')
    sns.publish(
        TopicArn=os.environ['SNS_TOPIC_ARN'],
        Message=json.dumps({
            'sender': 'ChatBot',
            'content': response_text,
            'timestamp': datetime.now().isoformat()
        })
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'status': 'message_processed',
            'response': response_text
        })
    }

def verify_signature(body, signature, secret):
    """Verify HMAC webhook signature"""
    expected_signature = hmac.new(
        secret.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

### 3.2 API Gateway Configuration

```yaml
# API Gateway resource for webhook
Resources:
  WebhookAPI:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: RetroMessengerWebhook

  WebhookResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref WebhookAPI
      ParentId: !GetAtt WebhookAPI.RootResourceId
      PathPart: webhook

  WebhookMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref WebhookAPI
      ResourceId: !Ref WebhookResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${WebhookLambda.Arn}/invocations'
```

---

## Part 4: Testing & Deployment

### 4.1 Testing Webhook Simulator

```javascript
// WebhookSimulator.test.js
import WebhookSimulator from './WebhookSimulator';

describe('WebhookSimulator', () => {
  let simulator;

  beforeEach(() => {
    simulator = new WebhookSimulator();
  });

  test('should send webhook successfully', async () => {
    const payload = {
      sender: 'testUser',
      content: 'Test message',
      timestamp: new Date().toISOString()
    };

    const result = await simulator.sendWebhook(payload);
    
    expect(result.success).toBe(true);
    expect(result.webhook.status).toBe('delivered');
  });

  test('should retry failed webhooks', async () => {
    const payload = { test: true };
    const result = await simulator.sendWebhook(payload);
    
    expect(result.webhook.attempts).toBeLessThanOrEqual(3);
  });

  test('should track webhook in queue', async () => {
    const payload = { test: true };
    await simulator.sendWebhook(payload);
    
    const webhooks = simulator.getAllWebhooks();
    expect(webhooks.length).toBeGreaterThan(0);
  });
});
```

### 4.2 Testing Chatbot

```javascript
// ChatbotEngine.test.js
import ChatbotEngine from './ChatbotEngine';

describe('ChatbotEngine', () => {
  let chatbot;

  beforeEach(() => {
    chatbot = new ChatbotEngine();
  });

  test('should respond to time command', async () => {
    const response = await chatbot.processMessage('What time is it?');
    expect(response).toContain('CURRENT TIME');
  });

  test('should respond to status command', async () => {
    const response = await chatbot.processMessage('STATUS');
    expect(response).toContain('BATTERY');
  });

  test('should maintain conversation history', async () => {
    await chatbot.processMessage('Hello');
    const history = chatbot.getHistory();
    
    expect(history.length).toBe(2); // user + bot
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('chatbot');
  });
});
```

---

## Conclusion

This implementation guide provides all necessary technical details for integrating webhooks and chatbots into your Retro Messenger application. Follow these patterns to create a functional demonstration of modern communication technologies wrapped in nostalgic aesthetics.

For the Kiroween Devpost submission, emphasize how Kiro's spec-driven development accelerated this implementation and how the architecture could scale to real AWS services.