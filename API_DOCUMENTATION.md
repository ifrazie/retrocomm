# Retro Messenger API Documentation

## Overview

This document provides comprehensive documentation for the Retro Messenger Express.js backend API. The API supports user authentication, real-time messaging with end-to-end encryption (E2EE), and webhook integrations.

**Base URL**: `http://localhost:3001/api`

**Content-Type**: `application/json` (for all POST requests)

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Messaging Routes](#messaging-routes)
3. [Webhook Routes](#webhook-routes)
4. [Send Routes](#send-routes)
5. [Middleware](#middleware)
6. [Error Responses](#error-responses)

---

## Authentication Routes

### POST /api/auth/register

Register a new user with username, password, and public key for E2EE.

**Endpoint**: `/api/auth/register`

**Method**: `POST`

**Authentication**: None

**Request Body**:
```json
{
  "username": "string (required, non-empty)",
  "password": "string (required, min 6 characters)",
  "publicKey": "string (required, RSA-2048 public key in PEM format)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "userId": "string (UUID)",
  "username": "string",
  "sessionId": "string (UUID)",
  "isNewUser": true
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid fields
  ```json
  {
    "error": "Username is required"
  }
  ```
  ```json
  {
    "error": "Password must be at least 6 characters"
  }
  ```
  ```json
  {
    "error": "Public key is required"
  }
  ```
  ```json
  {
    "error": "Username already exists"
  }
  ```

---

### POST /api/auth/login

Authenticate existing user and retrieve session credentials.

**Endpoint**: `/api/auth/login`

**Method**: `POST`

**Authentication**: None

**Request Body**:
```json
{
  "username": "string (required, non-empty)",
  "password": "string (required)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "userId": "string (UUID)",
  "username": "string",
  "sessionId": "string (UUID)",
  "publicKey": "string (RSA public key)",
  "encryptedPrivateKey": "string (encrypted private key)",
  "isNewUser": false
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields or invalid credentials
  ```json
  {
    "error": "Username is required"
  }
  ```
  ```json
  {
    "error": "Password is required"
  }
  ```
  ```json
  {
    "error": "Invalid username or password"
  }
  ```

---

### POST /api/auth/store-private-key

Store user's encrypted private key on the server (for E2EE key recovery).

**Endpoint**: `/api/auth/store-private-key`

**Method**: `POST`

**Authentication**: Session-based (sessionId required)

**Request Body**:
```json
{
  "sessionId": "string (required, UUID)",
  "encryptedPrivateKey": "string (required, encrypted with password-derived key)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields
  ```json
  {
    "error": "sessionId is required"
  }
  ```
  ```json
  {
    "error": "encryptedPrivateKey is required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```

---

### POST /api/auth/logout

Logout user and invalidate session.

**Endpoint**: `/api/auth/logout`

**Method**: `POST`

**Authentication**: Session-based (sessionId required)

**Request Body**:
```json
{
  "sessionId": "string (required, UUID)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true
}
```

**Error Responses**:
- `400 Bad Request`: Missing sessionId
  ```json
  {
    "error": "sessionId is required"
  }
  ```

---

### GET /api/auth/users

Get list of all registered users (excluding current user).

**Endpoint**: `/api/auth/users`

**Method**: `GET`

**Authentication**: Session-based (sessionId required)

**Query Parameters**:
- `sessionId` (string, required): User's session ID

**Success Response** (200 OK):
```json
{
  "users": [
    {
      "username": "string",
      "online": "boolean",
      "lastSeen": "number (timestamp)",
      "publicKey": "string (RSA public key for E2EE)"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Missing sessionId
  ```json
  {
    "error": "sessionId is required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```

---

### GET /api/auth/session

Verify session validity and retrieve user information.

**Endpoint**: `/api/auth/session`

**Method**: `GET`

**Authentication**: Session-based (sessionId required)

**Query Parameters**:
- `sessionId` (string, required): User's session ID

**Success Response** (200 OK):
```json
{
  "userId": "string (UUID)",
  "username": "string",
  "online": "boolean"
}
```

**Error Responses**:
- `400 Bad Request`: Missing sessionId
  ```json
  {
    "error": "sessionId is required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```

---

## Messaging Routes

### GET /api/messages/stream

Server-Sent Events (SSE) endpoint for real-time message delivery.

**Endpoint**: `/api/messages/stream`

**Method**: `GET`

**Authentication**: Session-based (sessionId required)

**Query Parameters**:
- `sessionId` (string, required): User's session ID

**Response Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**SSE Event Format**:
```
data: {"type": "connected", "userId": "string", "username": "string"}

data: {"type": "new_message", "message": {...}}
```

**Connection Lifecycle**:
1. Client connects with valid sessionId
2. User marked as online
3. Initial "connected" event sent
4. Real-time message events streamed
5. On disconnect: user marked offline, connection removed

**Error Responses**:
- `400 Bad Request`: Missing sessionId
  ```json
  {
    "error": "sessionId is required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```

---

### POST /api/messages/send

Send an encrypted or plain-text message to another user.

**Endpoint**: `/api/messages/send`

**Method**: `POST`

**Authentication**: Session-based (sessionId required)

**Request Body**:
```json
{
  "sessionId": "string (required, UUID)",
  "toUsername": "string (required, recipient username)",
  "content": "string (required, message content - encrypted or plain)",
  "encrypted": "boolean (optional, indicates if content is encrypted)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "messageId": "string (UUID)",
  "status": "string (delivered/pending)",
  "timestamp": "number (Unix timestamp)"
}
```

**Real-time Notification** (sent to recipient via SSE):
```json
{
  "type": "new_message",
  "message": {
    "messageId": "string (UUID)",
    "from": "string (sender username)",
    "fromUserId": "string (sender UUID)",
    "content": "string (encrypted or plain)",
    "encrypted": "boolean",
    "timestamp": "number",
    "status": "string"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
  ```json
  {
    "error": "sessionId, toUsername, and content are required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```
- `404 Not Found`: Recipient doesn't exist
  ```json
  {
    "error": "Recipient not found"
  }
  ```

---

### GET /api/messages/inbox

Retrieve user's inbox messages.

**Endpoint**: `/api/messages/inbox`

**Method**: `GET`

**Authentication**: Session-based (sessionId required)

**Query Parameters**:
- `sessionId` (string, required): User's session ID
- `limit` (number, optional): Maximum messages to return (default: 50)

**Success Response** (200 OK):
```json
{
  "messages": [
    {
      "messageId": "string (UUID)",
      "from": "string (sender userId)",
      "content": "string (encrypted or plain)",
      "timestamp": "number (Unix timestamp)",
      "status": "string (delivered/read)"
    }
  ],
  "unreadCount": "number"
}
```

**Error Responses**:
- `400 Bad Request`: Missing sessionId
  ```json
  {
    "error": "sessionId is required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```

---

### POST /api/messages/read

Mark a message as read.

**Endpoint**: `/api/messages/read`

**Method**: `POST`

**Authentication**: Session-based (sessionId required)

**Request Body**:
```json
{
  "sessionId": "string (required, UUID)",
  "messageId": "string (required, UUID)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": {
    "messageId": "string",
    "status": "read",
    "readAt": "number (timestamp)"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing fields
  ```json
  {
    "error": "sessionId and messageId are required"
  }
  ```
- `401 Unauthorized`: Invalid session
  ```json
  {
    "error": "Invalid session"
  }
  ```
- `404 Not Found`: Message not found
  ```json
  {
    "error": "Message not found"
  }
  ```

---

## Webhook Routes

### POST /api/webhook

Accept incoming webhook payloads and broadcast to connected SSE clients.

**Endpoint**: `/api/webhook`

**Method**: `POST`

**Authentication**: Bearer token (optional, controlled by AUTH_ENABLED env var)

**Middleware**:
- `authMiddleware`: Validates Bearer token if AUTH_ENABLED=true
- `validateMessageMiddleware`: Validates and sanitizes payload

**Request Headers** (if authentication enabled):
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "message": "string (required, message content)",
  "sender": "string (optional, sender identifier)",
  "timestamp": "number (optional, Unix timestamp)",
  "metadata": "object (optional, additional data)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "messageId": "string (UUID)"
}
```

**Broadcast Event** (sent to all SSE clients):
```json
{
  "id": "string (UUID)",
  "content": "string (sanitized message)",
  "timestamp": "number",
  "sender": "string (optional)",
  "metadata": "object (optional)"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payload
  ```json
  {
    "error": "Invalid payload",
    "details": ["message field is required"]
  }
  ```
  ```json
  {
    "error": "Invalid payload",
    "details": ["message must be a string"]
  }
  ```
- `401 Unauthorized`: Missing or invalid auth token (if AUTH_ENABLED=true)
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

## Send Routes

### POST /api/send

Forward messages to external webhook URLs with automatic retry logic.

**Endpoint**: `/api/send`

**Method**: `POST`

**Authentication**: None

**Request Body**:
```json
{
  "webhookUrl": "string (required, valid URL)",
  "message": "string (required, message content)",
  "sender": "string (optional, sender identifier)",
  "metadata": "object (optional, additional data)"
}
```

**Outgoing Webhook Payload** (sent to webhookUrl):
```json
{
  "message": "string",
  "sender": "string (optional)",
  "timestamp": "number (Unix timestamp)",
  "metadata": "object (optional)"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid fields
  ```json
  {
    "error": "Invalid payload",
    "details": ["webhookUrl and message are required"]
  }
  ```
  ```json
  {
    "error": "Invalid payload",
    "details": ["webhookUrl must be a valid URL"]
  }
  ```
- `500 Internal Server Error`: Webhook delivery failed after retries
  ```json
  {
    "error": "Failed to deliver message",
    "details": "Webhook returned status 500"
  }
  ```

**Retry Logic**:
- Maximum attempts: 3
- Initial delay: 1000ms
- Exponential backoff between retries

---

## Middleware

### authMiddleware

Validates Bearer token authentication for webhook endpoints.

**Location**: `server/middleware/auth.js`

**Behavior**:
- Checks `AUTH_ENABLED` environment variable
- If disabled, passes through without validation
- If enabled, validates `Authorization` header
- Supports both `Bearer <token>` and raw token formats
- Compares against `AUTH_TOKEN` environment variable

**Usage**:
```javascript
router.post('/webhook', authMiddleware, handler);
```

**Environment Variables**:
- `AUTH_ENABLED`: "true" to enable, any other value to disable
- `AUTH_TOKEN`: Expected bearer token value

---

### validateMessageMiddleware

Validates and sanitizes webhook message payloads.

**Location**: `server/middleware/validator.js`

**Validation Rules**:
- `message`: Required, must be string
- `sender`: Optional, must be string if provided
- `timestamp`: Optional, must be number if provided
- `metadata`: Optional, must be object if provided

**Sanitization**:
- Removes HTML tags from message and sender
- Encodes special characters: `& < > " ' /`
- Prevents XSS attacks

**Usage**:
```javascript
router.post('/webhook', validateMessageMiddleware, handler);
```

---

## Error Responses

### Standard Error Format

All error responses follow this structure:

```json
{
  "error": "string (error message)"
}
```

Or with additional details:

```json
{
  "error": "string (error message)",
  "details": "string or array (additional information)"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters or payload
- `401 Unauthorized`: Authentication failed or invalid session
- `404 Not Found`: Resource not found (user, message, etc.)
- `500 Internal Server Error`: Server-side error (webhook delivery failure, etc.)

---

## Environment Variables

### Required for Production

- `AUTH_ENABLED`: Set to "true" to enable webhook authentication
- `AUTH_TOKEN`: Bearer token for webhook authentication

### Optional

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

---

## Security Considerations

### End-to-End Encryption (E2EE)

- Messages can be encrypted client-side before transmission
- Server stores encrypted content without decryption capability
- Public keys exchanged via `/api/auth/users` endpoint
- Private keys encrypted with password-derived keys (PBKDF2)

### Authentication

- Session-based authentication using UUID session IDs
- Passwords hashed with bcrypt (10 rounds)
- Bearer token authentication for webhook endpoints
- Session validation on all protected routes

### Input Sanitization

- HTML tag removal from user input
- Special character encoding
- XSS prevention via validateMessageMiddleware
- URL validation for webhook endpoints

### Rate Limiting

**Note**: Not currently implemented. Consider adding rate limiting middleware for production deployments.

---

## WebSocket/SSE Architecture

### Server-Sent Events (SSE)

The application uses SSE for real-time message delivery instead of WebSockets:

**Advantages**:
- Simpler implementation
- Automatic reconnection
- Works over HTTP/HTTPS
- No special server configuration needed

**Connection Management**:
- Connections stored in `WebSocketService`
- Users marked online/offline based on connection status
- Automatic cleanup on client disconnect
- Broadcast capability to all or specific users

---

## Example Usage

### Complete Authentication Flow

```javascript
// 1. Register new user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'alice',
    password: 'securepass123',
    publicKey: '-----BEGIN PUBLIC KEY-----...'
  })
});
const { sessionId, userId } = await registerResponse.json();

// 2. Store encrypted private key
await fetch('/api/auth/store-private-key', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    encryptedPrivateKey: 'encrypted_key_data...'
  })
});

// 3. Connect to message stream
const eventSource = new EventSource(`/api/messages/stream?sessionId=${sessionId}`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// 4. Send message
await fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    toUsername: 'bob',
    content: 'encrypted_message_content',
    encrypted: true
  })
});
```

### Webhook Integration Example

```javascript
// Send message to external webhook
await fetch('/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhookUrl: 'https://example.com/webhook',
    message: 'Hello from Retro Messenger!',
    sender: 'RetroBot',
    metadata: { priority: 'high' }
  })
});

// Receive webhook (external service calling your endpoint)
await fetch('/api/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_secret_token'
  },
  body: JSON.stringify({
    message: 'Incoming webhook message',
    sender: 'ExternalService',
    timestamp: Date.now()
  })
});
```

---

## Testing

### Manual Testing with cURL

```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","publicKey":"test_key"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Send webhook
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"message":"Test message","sender":"curl"}'
```

### Automated Testing

See `server/test/` directory for comprehensive test suites using Supertest.

---

## Changelog

### Version 1.0.0 (Current)
- Initial API implementation
- User authentication with E2EE support
- Real-time messaging via SSE
- Webhook integration with retry logic
- Input validation and sanitization

---

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

**Project**: Retro Messenger  
**Hackathon**: Code with Kiro - Kiroween 2025  
**Documentation Version**: 1.0.0  
**Last Updated**: 2025-11-16
