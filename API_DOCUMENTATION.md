# Retro Messenger API Documentation

## Overview

The Retro Messenger backend provides a RESTful API for webhook-based messaging with real-time delivery via Server-Sent Events (SSE). The API supports receiving messages from external webhooks, forwarding messages to external services, and streaming messages to connected clients.

**Base URL**: `http://localhost:3001/api`

**Content-Type**: `application/json`

---

## Table of Contents

1. [Health Check](#health-check)
2. [Webhook Endpoint](#webhook-endpoint)
3. [Message Stream (SSE)](#message-stream-sse)
4. [Send Message](#send-message)
5. [Authentication](#authentication)
6. [Error Responses](#error-responses)
7. [Middleware](#middleware)

---

## Health Check

### GET /api/health

Simple health check endpoint to verify the server is running.

**Authentication**: None

**Request Parameters**: None

**Response**:
```json
{
  "status": "ok",
  "message": "Retro Messenger backend is running"
}
```

**Status Codes**:
- `200 OK` - Server is running

**Example**:
```bash
curl http://localhost:3001/api/health
```

---

## Webhook Endpoint

### POST /api/webhook

Accepts incoming webhook payloads and broadcasts them to all connected SSE clients in real-time.

**Authentication**: Optional Bearer token (see [Authentication](#authentication))

**Middleware**:
- `authMiddleware` - Validates Bearer token if `AUTH_ENABLED=true`
- `validateMessageMiddleware` - Validates and sanitizes message payload

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>  (optional, if AUTH_ENABLED=true)
```

**Request Body**:
```json
{
  "message": "string (required)",
  "sender": "string (optional)",
  "timestamp": "number (optional, Unix timestamp in milliseconds)",
  "metadata": "object (optional)"
}
```

**Field Descriptions**:
- `message` (required): The message content. Will be sanitized to prevent XSS attacks.
- `sender` (optional): Identifier for the message sender. Will be sanitized.
- `timestamp` (optional): Unix timestamp in milliseconds. Defaults to current time if not provided.
- `metadata` (optional): Additional metadata object for the message.

**Response**:
```json
{
  "success": true,
  "messageId": "uuid-v4-string"
}
```

**Status Codes**:
- `200 OK` - Message received and broadcast successfully
- `400 Bad Request` - Invalid payload structure
- `401 Unauthorized` - Missing or invalid authentication token

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "message": "Hello from external webhook!",
    "sender": "ExternalBot",
    "timestamp": 1699876543210,
    "metadata": {
      "source": "slack",
      "channel": "#general"
    }
  }'
```

**Example Response**:
```json
{
  "success": true,
  "messageId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Broadcast Format** (sent to SSE clients):
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Hello from external webhook!",
  "timestamp": 1699876543210,
  "sender": "ExternalBot",
  "metadata": {
    "source": "slack",
    "channel": "#general"
  }
}
```

---

## Message Stream (SSE)

### GET /api/messages/stream

Server-Sent Events endpoint for real-time message delivery. Clients connect to this endpoint to receive messages as they arrive.

**Authentication**: None

**Request Parameters**: None

**Response Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Event Format**:
```
data: {"type":"connected"}

data: {"id":"uuid","content":"message","timestamp":1699876543210,"sender":"User"}
```

**Initial Connection Event**:
```json
{
  "type": "connected"
}
```

**Message Event Format**:
```json
{
  "id": "uuid-v4-string",
  "content": "Message content",
  "timestamp": 1699876543210,
  "sender": "Sender name (optional)",
  "metadata": {}
}
```

**Status Codes**:
- `200 OK` - Connection established

**Connection Lifecycle**:
1. Client connects to `/api/messages/stream`
2. Server sends initial `{"type":"connected"}` event
3. Client is added to active SSE clients list
4. Server broadcasts all incoming webhook messages to this client
5. On disconnect, client is removed from active list

**Example (JavaScript)**:
```javascript
const eventSource = new EventSource('http://localhost:3001/api/messages/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connected') {
    console.log('Connected to message stream');
  } else {
    console.log('New message:', data);
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```

**Example (curl)**:
```bash
curl -N http://localhost:3001/api/messages/stream
```

---

## Send Message

### POST /api/send

Forwards messages to external webhook URLs with automatic retry logic and exponential backoff.

**Authentication**: None

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "webhookUrl": "string (required, valid URL)",
  "message": "string (required)",
  "sender": "string (optional)",
  "metadata": "object (optional)"
}
```

**Field Descriptions**:
- `webhookUrl` (required): Valid URL to send the webhook to. Must be a properly formatted URL.
- `message` (required): The message content to send.
- `sender` (optional): Identifier for the message sender.
- `metadata` (optional): Additional metadata object.

**Payload Sent to Webhook**:
```json
{
  "message": "string",
  "sender": "string (if provided)",
  "timestamp": 1699876543210,
  "metadata": {}
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Response (Failure)**:
```json
{
  "error": "Failed to deliver message",
  "details": "Error message"
}
```

**Status Codes**:
- `200 OK` - Message sent successfully
- `400 Bad Request` - Invalid payload or URL format
- `500 Internal Server Error` - Failed to deliver message after retries

**Retry Logic**:
- Maximum attempts: 3
- Exponential backoff: 1s, 2s, 4s
- Retries on any non-2xx response from webhook URL

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "message": "Hello from Retro Messenger!",
    "sender": "PagerBot",
    "metadata": {
      "priority": "high"
    }
  }'
```

**Example Response**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## Authentication

The webhook endpoint (`POST /api/webhook`) supports optional Bearer token authentication.

**Configuration**:

Authentication is controlled via environment variables:

```bash
AUTH_ENABLED=true
AUTH_TOKEN=your-secret-token-here
```

**When Enabled**:
- All requests to `/api/webhook` must include an `Authorization` header
- Token must match the `AUTH_TOKEN` environment variable

**When Disabled** (default):
- No authentication required
- All requests are accepted

**Header Format**:
```
Authorization: Bearer your-secret-token-here
```

**Unauthorized Response**:
```json
{
  "error": "Unauthorized"
}
```

**Status Code**: `401 Unauthorized`

---

## Error Responses

All error responses follow a consistent format:

### Validation Errors (400 Bad Request)

```json
{
  "error": "Invalid payload",
  "details": [
    "message field is required"
  ]
}
```

**Common Validation Errors**:
- Missing required fields (`message`, `webhookUrl`)
- Invalid field types (e.g., `message` must be string, `timestamp` must be number)
- Invalid URL format for `webhookUrl`
- Invalid metadata structure (must be object)

### Authentication Errors (401 Unauthorized)

```json
{
  "error": "Unauthorized"
}
```

**Causes**:
- Missing `Authorization` header when `AUTH_ENABLED=true`
- Invalid or mismatched Bearer token

### Server Errors (500 Internal Server Error)

```json
{
  "error": "Failed to deliver message",
  "details": "Webhook returned status 404"
}
```

**Causes**:
- External webhook URL unreachable
- External webhook returned non-2xx status
- Network errors after all retry attempts

---

## Middleware

### Authentication Middleware

**File**: `server/middleware/auth.js`

**Purpose**: Validates Bearer tokens for protected endpoints

**Behavior**:
- Checks `AUTH_ENABLED` environment variable
- If disabled, passes through without validation
- If enabled, validates `Authorization` header format
- Compares token against `AUTH_TOKEN` environment variable
- Returns 401 if authentication fails

**Applied To**:
- `POST /api/webhook`

### Validation Middleware

**File**: `server/middleware/validator.js`

**Purpose**: Validates and sanitizes webhook payloads

**Validation Rules**:
- `message` field is required and must be a string
- `sender` must be a string if provided
- `timestamp` must be a number if provided
- `metadata` must be an object if provided

**Sanitization**:
- Strips HTML tags from message content
- Encodes special characters (`<`, `>`, `&`, `"`, `'`, `/`)
- Prevents XSS attacks through content injection

**Applied To**:
- `POST /api/webhook`

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting middleware to prevent abuse.

**Recommended Implementation**:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/webhook', limiter);
```

---

## CORS Configuration

CORS is enabled for all origins:

```javascript
app.use(cors());
```

**Headers Set**:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

For production, restrict CORS to specific origins:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Server port number |
| `AUTH_ENABLED` | No | `false` | Enable Bearer token authentication |
| `AUTH_TOKEN` | Conditional | - | Bearer token for authentication (required if `AUTH_ENABLED=true`) |

**Example `.env` file**:
```bash
PORT=3001
AUTH_ENABLED=true
AUTH_TOKEN=my-secret-webhook-token-12345
```

---

## Testing Examples

### Test Webhook Reception

```bash
# Send a test message to the webhook
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message","sender":"TestBot"}'
```

### Test SSE Connection

```bash
# Connect to message stream
curl -N http://localhost:3001/api/messages/stream
```

### Test Message Forwarding

```bash
# Forward message to external webhook
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl":"https://webhook.site/your-unique-url",
    "message":"Test forwarding"
  }'
```

### Test with Authentication

```bash
# With valid token
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"message":"Authenticated message"}'

# Without token (should fail if AUTH_ENABLED=true)
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":"Unauthenticated message"}'
```

---

## Integration Examples

### JavaScript/React Frontend

```javascript
// Connect to SSE stream
const connectToMessageStream = () => {
  const eventSource = new EventSource('http://localhost:3001/api/messages/stream');
  
  eventSource.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type !== 'connected') {
      displayMessage(message);
    }
  };
  
  return eventSource;
};

// Send message via webhook
const sendMessage = async (content, sender) => {
  const response = await fetch('http://localhost:3001/api/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token'
    },
    body: JSON.stringify({
      message: content,
      sender: sender,
      timestamp: Date.now()
    })
  });
  
  return response.json();
};

// Forward to external webhook
const forwardMessage = async (webhookUrl, message) => {
  const response = await fetch('http://localhost:3001/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      webhookUrl,
      message,
      sender: 'RetroMessenger'
    })
  });
  
  return response.json();
};
```

### Python Integration

```python
import requests
import json
from sseclient import SSEClient

# Send webhook message
def send_webhook_message(message, sender=None):
    url = 'http://localhost:3001/api/webhook'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
    }
    payload = {
        'message': message,
        'sender': sender,
        'timestamp': int(time.time() * 1000)
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# Listen to SSE stream
def listen_to_messages():
    url = 'http://localhost:3001/api/messages/stream'
    messages = SSEClient(url)
    
    for msg in messages:
        if msg.data:
            data = json.loads(msg.data)
            if data.get('type') != 'connected':
                print(f"New message: {data}")

# Forward message
def forward_message(webhook_url, message):
    url = 'http://localhost:3001/api/send'
    payload = {
        'webhookUrl': webhook_url,
        'message': message,
        'sender': 'PythonBot'
    }
    
    response = requests.post(url, json=payload)
    return response.json()
```

---

## Architecture Notes

### Message Flow

1. **Incoming Webhook** → `POST /api/webhook` → Validation → Broadcast to SSE clients
2. **SSE Connection** → `GET /api/messages/stream` → Persistent connection → Receives broadcasts
3. **Outgoing Webhook** → `POST /api/send` → Retry logic → External webhook URL

### SSE Client Management

- Clients are stored in memory (`sseClients` array)
- Automatically removed on disconnect
- All connected clients receive all broadcast messages
- No message persistence (messages only delivered to active connections)

### Retry Strategy

The `/api/send` endpoint uses exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Attempt 4: 4 seconds delay

Total maximum delay: ~7 seconds before failure

---

## Security Considerations

1. **XSS Prevention**: All message content is sanitized before broadcasting
2. **Authentication**: Optional Bearer token authentication for webhook endpoint
3. **CORS**: Currently allows all origins (restrict in production)
4. **Rate Limiting**: Not implemented (add for production)
5. **Input Validation**: Strict validation of all payload fields
6. **HTTPS**: Use HTTPS in production to encrypt Bearer tokens

---

## Troubleshooting

### SSE Connection Drops

**Symptom**: Client disconnects frequently

**Solutions**:
- Check network stability
- Implement reconnection logic in client
- Add heartbeat/ping mechanism

### Webhook Delivery Failures

**Symptom**: Messages fail to send to external webhooks

**Solutions**:
- Verify webhook URL is accessible
- Check external service status
- Review server logs for detailed error messages
- Ensure external webhook accepts JSON payloads

### Authentication Issues

**Symptom**: 401 Unauthorized errors

**Solutions**:
- Verify `AUTH_ENABLED` environment variable
- Check `AUTH_TOKEN` matches between server and client
- Ensure `Authorization` header format is correct: `Bearer <token>`

---

## Version History

- **v1.0.0** - Initial release with webhook, SSE, and send endpoints

---

## Support

For issues or questions, please refer to the project repository or contact the development team.
