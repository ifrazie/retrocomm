# Retro Messenger 📟📠

A nostalgic web application that brings vintage communication devices (pagers and fax machines) into the modern era. Experience the charm of retro technology with modern reliability through webhook-based messaging.

## Features

### 🟢 Pager Mode
- Classic green-on-black monospace display
- 240-character message limit per message
- Audible beep notifications for new messages
- Scrollable history of last 50 messages
- CRT screen effects with scanlines and glow

### 📄 Fax Mode
- Vintage fax document rendering with paper texture
- Progressive line-by-line transmission animation
- Scan lines, distortion, and noise effects
- Archive of up to 100 received fax documents
- Thumbnail gallery with full-size document viewer

### 🔗 Webhook Integration
- Receive messages via HTTP POST webhooks
- Send messages to external webhook endpoints
- Optional authentication with Bearer tokens
- Real-time message delivery via Server-Sent Events (SSE)
- Automatic retry with exponential backoff

### ⚙️ Additional Features
- Seamless mode switching between pager and fax
- Message history preserved across mode changes
- Connection status indicators
- Configurable webhook endpoints
- Responsive design for mobile and desktop
- XSS protection with content sanitization

## Prerequisites

- Node.js 16+ and npm
- Modern web browser with Canvas API support

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd retro-messenger
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run server
```
The server will run on `http://localhost:3001`

2. In a separate terminal, start the frontend development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

## Configuration

### Webhook Setup

1. Click the settings icon (⚙️) in the top-right corner
2. Configure your webhook URLs:
   - **Incoming Webhook URL**: The backend endpoint where you'll receive messages (displayed in settings)
   - **Outgoing Webhook URL**: External endpoint where messages will be sent
3. (Optional) Enable authentication and set a Bearer token
4. Click "Save Configuration"

### Webhook Endpoints

#### Receive Messages (Incoming)
```
POST http://localhost:3001/api/webhook
```

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-token> (if auth enabled)
```

**Request Body:**
```json
{
  "message": "Your message text here",
  "sender": "optional-sender-id",
  "timestamp": 1234567890000,
  "metadata": {
    "platform": "slack",
    "channelId": "C123456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "uuid-v4-string"
}
```

#### Send Messages (Outgoing)
Configure your outgoing webhook URL in settings. Messages sent from the UI will be forwarded to this endpoint with the same format as above.

### Example Webhook Payloads

**Simple Message:**
```json
{
  "message": "Hello from Retro Messenger!"
}
```

**Message with Metadata:**
```json
{
  "message": "Meeting in 5 minutes",
  "sender": "alice@example.com",
  "timestamp": 1699564800000,
  "metadata": {
    "priority": "high",
    "category": "reminder"
  }
}
```

**Long Message (will be truncated in pager mode):**
```json
{
  "message": "This is a very long message that exceeds the 240 character limit in pager mode. It will be automatically truncated with an ellipsis to maintain the authentic pager experience. However, in fax mode, the entire message will be rendered on the document."
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

## Architecture

### Frontend (React)
- **React 18** with hooks for state management
- **Vite** for fast development and optimized builds
- **Context API** for global state (messages, configuration)
- **Canvas API** for fax document rendering
- **Server-Sent Events (SSE)** for real-time message delivery

### Backend (Node.js/Express)
- **Express** web server
- **CORS** enabled for cross-origin requests
- **Authentication middleware** for optional token validation
- **Validation middleware** for payload sanitization
- **SSE** for broadcasting messages to connected clients

### Key Components

- `PagerInterface` - Retro pager display with green-on-black styling
- `FaxInterface` - Vintage fax machine with document rendering
- `WebhookConfig` - Settings panel for webhook configuration
- `StatusIndicator` - Connection status display
- `ModeToggle` - Switch between pager and fax modes
- `MessageContext` - Global message queue management
- `ConfigContext` - Application configuration and persistence

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Canvas API and Server-Sent Events are required for full functionality.

## Troubleshooting

### Messages not appearing
- Check that the backend server is running on port 3001
- Verify webhook configuration in settings
- Check browser console for errors
- Ensure SSE connection is established (check status indicator)

### Fax rendering issues
- If you see "Canvas rendering unavailable" warning, your browser may not support Canvas API
- The app will fall back to plain text display
- Try updating your browser to the latest version

### Authentication errors
- Verify the Bearer token matches between sender and receiver
- Check that authentication is enabled in settings if required
- Ensure the Authorization header format is correct: `Bearer <token>`

### Connection issues
- Check that both frontend and backend are running
- Verify no firewall is blocking ports 3001 or 5173
- Check browser console for CORS errors

## Performance Optimization

The application includes several performance optimizations:
- React.memo for message and thumbnail components
- Optimized canvas rendering with willReadFrequently flag
- Pixel sampling for texture effects (every 4th pixel)
- Off-screen canvas for fax rendering
- Message history limited to 50 (pager) / 100 (fax)

## Security

- All message content is sanitized using DOMPurify
- XSS protection on incoming webhooks
- Optional Bearer token authentication
- CORS configuration for production deployment
- Input validation on all endpoints

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built with nostalgia for the communication devices of yesteryear. 📟📠✨
