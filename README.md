# Retro Messenger 📟📠

A nostalgic web application that brings vintage communication devices (pagers and fax machines) into the modern era. Experience the charm of retro technology with modern chatbot integration and simulated webhook functionality.

## Features

### 🟢 Pager Mode
- Classic green-on-black monospace LCD display
- Authentic pager interface with physical button controls
- Displays last 5 messages with sender, timestamp, and content
- Message status indicators (SENDING, DELIVERED)
- Alert LED for new unread messages
- CRT screen effects with retro styling

### 📄 Fax Mode
- Vintage thermal fax machine interface
- Dot-matrix printer styling with paper texture
- Progressive transmission animation with scanning line
- Full message history displayed as fax documents
- Page headers with sender, date, and page numbers
- Authentic fax machine controls and indicators

### 🤖 Built-in Chatbot
- Automated responses to user messages
- Command recognition (HELP, STATUS, INFO, TIME, WEATHER)
- Typing indicators with retro animation
- Bot messages clearly labeled with [BOT] prefix
- Context-aware default responses

### 🔗 Webhook Integration
- **Configurable Webhook Endpoints**: Set custom outgoing webhook URLs for message delivery
- **Authentication Support**: Optional Bearer token authentication for secure webhook calls
- **Incoming Webhook URL**: Unique endpoint for receiving messages from external services
- **Visual Status Indicators**: Real-time webhook transmission animations
- **Animated Delivery Status**: "Sending" status during message delivery with confirmation
- **Connection Monitoring**: Webhook status display (CONNECTED, TRANSMITTING)
- **Settings Panel**: Easy-to-use configuration interface with copy-to-clipboard functionality
- **AWS Kiro Integration**: Built-in support for AWS Kiro webhook patterns

### ⚙️ Additional Features
- Seamless mode switching between pager and fax
- Message history preserved across mode changes
- Pre-loaded example messages for demonstration
- Responsive design for mobile and desktop
- Retro-themed header with nostalgic branding
- Kiroween Hackathon 2025 themed footer

## Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

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

Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:5173`. Open your browser and navigate to this URL.

### Production Build

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The application is a standalone frontend demo and does not require a backend server.

## Usage

### Configuring Webhooks

1. Click the **⚙ Settings** button in the header or the **⚙ MENU** button in pager/fax controls
2. Configure your webhook settings:
   - **Outgoing Webhook URL**: Enter the endpoint where messages will be sent
   - **Enable Authentication**: Toggle to require Bearer token authentication
   - **Auth Token**: Enter your Bearer token (only if authentication is enabled)
3. Copy your unique **Incoming Webhook URL** to receive messages from external services
4. Click **Save Configuration** to apply changes

**Note**: The incoming webhook URL is unique to your session and can be used to send messages to your Retro Messenger instance from external applications or services.

### Sending Messages

1. Type your message in the input field at the bottom of the interface
2. Press Enter or click the SEND (pager) / TRANSMIT (fax) button
3. Watch the webhook transmission animation
4. Your message appears with a "SENDING" status, then changes to "DELIVERED"
5. After 2 seconds, the chatbot responds automatically
6. If configured, messages are also sent to your outgoing webhook endpoint

### Chatbot Commands

The built-in chatbot recognizes these commands:

- **HELP** - Display available commands
- **STATUS** - Show system status
- **INFO** - Display application information
- **TIME** - Show current time
- **WEATHER** - Display weather information

Simply include any of these keywords in your message to trigger the corresponding response.

### Interface Controls

**Pager Mode:**
- ▲ UP - Scroll to top
- 📠 FAX - Switch to fax mode
- ▼ DOWN - Scroll to bottom
- ✕ CLEAR - Clear all messages
- ⚙ MENU - Open webhook settings panel
- ✓ READ - Mark messages as read (clears alert LED)

**Fax Mode:**
- 📟 PAGER - Switch to pager mode
- 🗑 CLEAR - Clear all messages
- ⚙ MENU - Open webhook settings panel
- ✓ READ - Mark messages as read

### Example Messages

The application comes pre-loaded with 10 example messages demonstrating:
- Regular messages from users (Alice, Bob, Manager, etc.)
- Chatbot responses with weather and reminders
- System notifications
- Various message types and timestamps

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
- **React 18** with hooks (useState, useEffect, useRef) for state management
- **Vite** for fast development and optimized builds
- **Standalone application** - No backend required
- **CSS Grid** and Flexbox for responsive layouts
- **CSS Custom Properties** for themeable, responsive design
- **CSS Animations** for retro effects (scanning lines, typing indicators, LED alerts)

### Key Features Implementation

**Message Management:**
- Messages stored in component state
- Pre-loaded with 10 example messages
- Message types: 'sent', 'received', 'bot'
- Status tracking: 'sending', 'delivered'

**Webhook Configuration:**
- Persistent webhook settings stored in component state
- Configurable outgoing webhook URL for message delivery
- Optional Bearer token authentication
- Unique incoming webhook URL generation
- Copy-to-clipboard functionality for easy sharing
- Settings panel with toggle visibility

**Chatbot Engine:**
- Pattern matching for command recognition
- Configurable response dictionary
- Simulated typing delay (2 seconds)
- Automatic response to all user messages

**Webhook Simulation:**
- Visual transmission indicators
- 1.5-second simulated delivery delay
- Status updates (connected → sending → connected)
- Animated spinner during transmission

**UI Components:**
- Pager view with LCD display and physical buttons
- Fax view with thermal printer styling
- Mode switcher with active state indicators
- Input area with send button
- Webhook status display with LED indicators

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Modern JavaScript (ES6+) support required for full functionality.

## Webhook Configuration Details

### Outgoing Webhooks

When you configure an outgoing webhook URL, Retro Messenger will send HTTP POST requests to that endpoint whenever you send a message. The payload structure is:

```json
{
  "sender": "You",
  "content": "Your message text",
  "timestamp": "14:32",
  "type": "sent"
}
```

If authentication is enabled, requests include a Bearer token header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Incoming Webhooks

Your unique incoming webhook URL allows external services to send messages to your Retro Messenger instance. To send a message, make a POST request to your incoming webhook URL with this payload:

```json
{
  "sender": "External Service",
  "content": "Message from external system",
  "type": "received"
}
```

The message will appear in your pager or fax interface immediately.

### Security Considerations

- **Authentication**: Always enable Bearer token authentication for production webhooks
- **HTTPS**: Use HTTPS endpoints for secure transmission
- **Token Storage**: Keep your auth tokens secure and never commit them to version control
- **Incoming URL**: Treat your incoming webhook URL as sensitive - anyone with this URL can send messages to your interface

## Troubleshooting

### Messages not appearing
- Ensure you're typing in the input field and pressing Enter or clicking SEND
- Check browser console for JavaScript errors
- Try refreshing the page

### Chatbot not responding
- Wait 2 seconds after sending a message for the chatbot response
- The chatbot responds to all messages automatically
- Try sending a command like "HELP" or "STATUS"

### Animations not working
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check that hardware acceleration is enabled in browser settings
- Try disabling browser extensions that might interfere with CSS animations

### Display issues
- The application is optimized for desktop and mobile browsers
- Try zooming in/out if text appears too small or large
- Clear browser cache and reload if styles appear broken

### Webhook configuration not saving
- Ensure you click the "Save Configuration" button after making changes
- Check browser console for any JavaScript errors
- Verify your webhook URL is a valid HTTP/HTTPS endpoint

### Incoming webhook not working
- Ensure you're sending POST requests to the correct incoming webhook URL
- Verify the request payload matches the expected JSON structure
- Check that CORS is properly configured if sending from a web application

## User Interface

The application features a simplified, retro-themed interface with:

### Header
- **Retro branding**: "⚡ RETRO MESSENGER ⚡" title with nostalgic styling
- **Subtitle**: "Modern Messaging Reimagined with 1980s Tech"
- **Mode toggle**: Switch between Pager and Fax modes
- **Settings button**: Access webhook configuration panel with:
  - Outgoing webhook URL configuration
  - Bearer token authentication setup
  - Incoming webhook URL display with copy functionality
  - Save/cancel controls

### Main Display Area
- Full-width device interface (Pager or Fax mode)
- Immersive retro experience without distracting sidebars
- Responsive design adapts to all screen sizes

### Footer
- **Kiroween branding**: "🎃 Kiroween Hackathon 2025"
- **Attribution**: Links to AWS Kiro with proper rel attributes
- **Theme**: Webhooks & Chatbots showcase

### Responsive Design
- **Mobile (< 768px)**: Stacked layout with touch-optimized controls
- **Tablet (768px - 1023px)**: Optimized spacing for medium screens
- **Desktop (≥ 1024px)**: Full-width immersive experience

## Performance Optimization

The application includes several performance optimizations:
- Lightweight component structure with minimal re-renders
- Efficient state management with React hooks
- CSS-based animations for smooth performance
- Auto-scroll to latest message using refs
- Message display limited to last 5 in pager mode
- Simplified layout structure for faster rendering

## Demo Features

This is a demonstration application showcasing:
- Retro UI/UX design principles
- Simulated webhook integration patterns
- Basic chatbot command processing
- Mode switching between different interface paradigms
- Authentic vintage device aesthetics

For production use, consider integrating:
- Real backend API for message persistence
- Actual webhook endpoints for external integrations (now configurable via settings)
- Webhook signature verification for security
- Advanced chatbot with NLP capabilities
- User authentication and multi-user support
- Message encryption and security features
- Webhook retry logic and failure handling
- Rate limiting for incoming webhook requests

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

Built with nostalgia for the communication devices of yesteryear. 📟📠✨
