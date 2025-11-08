# API Documentation

## Overview

This API provides a real-time messaging system with webhook support, Server-Sent Events (SSE) for live updates, and message forwarding capabilities.

**Base URL:** `http://localhost:3001/api`

**Global Middleware:**
- CORS enabled for all origins
- JSON body parser

---

## Authentication

Authentication is optional and controlled via environment variables:
- **Environment Variable:** `AUTH_ENABLED=true` (enables authentication)
- **Token Variable:** `AUTH_TOKEN=<your-token>` (sets the expected token)

When enabled, protected endpoints require:
- **Header:** `Authorization: Bearer <token>`
- **Status Codes:**
  - `401 Unauthorized` - Missing or invalid token

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the server is running.

**Authentication:** None

**Request Parameters:** None

**Response:**

**Status Code:** `200 OK`

```json
{
  "status": "ok",
  "message": "Retro Messenger backend is running"
}
```

---

### 2. Webhook Receiver

**POST** `/api/webhook`

Accepts incoming webhook payloads and broadcasts messages to all connected SSE clients.

**Authentication:** Required (if `AUTH_ENABLED=true`)

**Middleware:**
- `authMiddleware` - Validates Bearer token
- `validateMessageMiddleware` - Validates and sanitizes payload

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>  (if auth enabled)
```

**Request Body:**

```json
{
  "message": "string (required)",
  "sender": "string (optional)",
  "timestamp": "number (optional)",
  "metadata": "object (optional)"
}
```

**Field Descriptions:**
- `message` (required): The message content (string). Will be sanitized to prevent XSS.
- `sender` (optional): Identifier for the message sender (string). Will be sanitized.
- `timestamp` (optional): Unix timestamp in milliseconds (number). Defaults to current time if not provided.
- `metadata` (optional): Additional metadata as a JSON object.

**Validation Rules:**
- `message` field is required and must be a string
- `sender` must be a string if provided
- `timestamp` must be a number if provided
- `metadata` must be an object if provided
- HTML tags are stripped from `message` and `sender`
- Special characters are encoded to prevent XSS attacks

**Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "messageId": "uuid-v4-string"
}
```

**Error Responses:**

**Status Code:** `400 Bad Request`

```json
{
  "error": "Invalid payload",
  "details": ["message field is required"]
}
```

**Status Code:** `401 Unauthorized`

```json
{
  "error": "Unauthorized"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "message": "Hello, World!",
    "sender": "User123",
    "metadata": {
      "priority": "high"
    }
  }'
```

---

### 3. Message Stream (SSE)

**GET** `/api/messages/stream`

Server-Sent Events endpoint for receiving real-time message updates.

**Authentication:** None

**Request Parameters:** None

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Response Format:**

The endpoint streams messages in SSE format. Each message is sent as:

```
data: <json-object>\n\n
```

**Initial Connection Message:**

```
data: {"type":"connected"}
```

**Broadcast Message Format:**

```json
{
  "id": "uuid-v4-string",
  "content": "message text",
  "timestamp": 1234567890123,
  "sender": "optional-sender-id",
  "metadata": {
    "optional": "metadata"
  }
}
```

**Connection Lifecycle:**
- Client connects and receives a `{"type":"connected"}` message
- Client remains connected and receives messages as they are broadcast
- Connection closes when client disconnects
- Client is automatically removed from the broadcast list on disconnect

**Example Usage (JavaScript):**

```javascript
const eventSource = new EventSource('http://localhost:3001/api/messages/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received message:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```

---

### 4. Send Message to External Webhook

**POST** `/api/send`

Forwards messages to external webhook URLs with automatic retry logic.

**Authentication:** None

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

```json
{
  "webhookUrl": "string (required)",
  "message": "string (required)",
  "sender": "string (optional)",
  "metadata": "object (optional)"
}
```

**Field Descriptions:**
- `webhookUrl` (required): Valid URL to send the webhook to
- `message` (required): The message content to send
- `sender` (optional): Identifier for the message sender
- `metadata` (optional): Additional metadata as a JSON object

**Validation Rules:**
- `webhookUrl` and `message` are required
- `webhookUrl` must be a valid URL format

**Retry Logic:**
- Maximum retries: 3 attempts
- Initial backoff: 1000ms
- Exponential backoff on subsequent retries

**Outgoing Webhook Payload:**

The endpoint sends the following payload to the specified webhook URL:

```json
{
  "message": "string",
  "sender": "string or undefined",
  "timestamp": 1234567890123,
  "metadata": "object or undefined"
}
```

**Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Responses:**

**Status Code:** `400 Bad Request`

```json
{
  "error": "Invalid payload",
  "details": ["webhookUrl and message are required"]
}
```

or

```json
{
  "error": "Invalid payload",
  "details": ["webhookUrl must be a valid URL"]
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "error": "Failed to deliver message",
  "details": "error message"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://example.com/webhook",
    "message": "Hello from Retro Messenger!",
    "sender": "System",
    "metadata": {
      "source": "api"
    }
  }'
```

---

## Error Handling

All endpoints follow consistent error response formats:

**Validation Errors (400):**
```json
{
  "error": "Error type",
  "details": ["Array of specific error messages"]
}
```

**Authentication Errors (401):**
```json
{
  "error": "Unauthorized"
}
```

**Server Errors (500):**
```json
{
  "error": "Error type",
  "details": "Error message"
}
```

---

## Security Features

### XSS Prevention
- All message content and sender fields are sanitized
- HTML tags are stripped
- Special characters are encoded

### Authentication
- Optional Bearer token authentication
- Configurable via environment variables
- Applied to sensitive endpoints (webhook receiver)

### CORS
- Enabled for all origins
- Allows cross-origin requests from any domain

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3001` | No |
| `AUTH_ENABLED` | Enable authentication | `false` | No |
| `AUTH_TOKEN` | Expected Bearer token | - | If auth enabled |

---

## Message Flow

### Receiving Messages (Webhook → SSE)
1. External service sends POST to `/api/webhook`
2. Authentication middleware validates token (if enabled)
3. Validation middleware checks and sanitizes payload
4. Message is assigned a unique ID
5. Message is broadcast to all connected SSE clients
6. Success response returned to sender

### Sending Messages (API → External Webhook)
1. Client sends POST to `/api/send` with webhook URL
2. Payload is validated
3. Message is sent to external webhook with retry logic
4. Up to 3 attempts with exponential backoff
5. Success or failure response returned

### Real-time Updates (SSE)
1. Client connects to `/api/messages/stream`
2. Connection established with SSE headers
3. Client receives connection confirmation
4. Client receives all broadcast messages in real-time
5. Connection maintained until client disconnects

---

## Status Code Summary

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid payload or parameters |
| `401` | Unauthorized - Missing or invalid authentication |
| `500` | Internal Server Error - Failed to process request |
