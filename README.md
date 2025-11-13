# Retro Messenger 📟📠

A nostalgic web application that brings vintage communication devices (pagers and fax machines) into the modern era. Experience the charm of retro technology with **AI-powered chatbot integration** (via LM Studio) and simulated webhook functionality.

## 🆕 What's New

**LM Studio Integration** - The chatbot now supports real AI responses using locally-run language models:
- Connect to LM Studio for intelligent, context-aware conversations
- Automatic fallback to simulated responses when offline
- Mode-specific AI personality (pager/fax context awareness)
- Maintains conversation history for multi-turn dialogues
- Optimized for retro display with concise responses

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

### 🤖 AI-Powered Chatbot (LM Studio Integration)
- **Real LLM Integration**: Connect to LM Studio for intelligent AI responses
- **Fallback Mode**: Automatic fallback to simulated responses when LM Studio is offline
- **Context-Aware Conversations**: Maintains conversation history for coherent multi-turn dialogues
- **Mode-Specific Prompts**: AI adapts responses based on pager/fax interface mode
- **Command Recognition**: Supports HELP, STATUS, INFO, TIME, WEATHER commands
- **Concise Responses**: Optimized for retro display with 150-token limit
- **Typing Indicators**: Retro animation during AI response generation
- **Bot Messages**: Clearly labeled with [BOT] prefix in retro terminal style

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
- TypeScript 5.0+ (for type checking and future TypeScript migration)
- **LM Studio** (optional, for AI chatbot functionality)
  - Download from [lmstudio.ai](https://lmstudio.ai)
  - Any compatible LLM model loaded (e.g., Qwen2.5-7B-Instruct)
  - Local server running on default port

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

This includes:
- `@lmstudio/sdk` - LM Studio JavaScript SDK for AI chatbot integration
- React, Vite, and other core dependencies

**Note:** If you encounter ESLint errors, you may need to install the TypeScript ESLint dependency:
```bash
npm install --save-dev typescript-eslint
```

3. **(Optional) Set up LM Studio for AI chatbot:**
```bash
# Install LM Studio from https://lmstudio.ai
# Download any compatible model (e.g., Qwen2.5-7B-Instruct)
lms get qwen2.5-7b-instruct

# Load the model
lms load qwen2.5-7b-instruct

# The application will automatically connect to the currently loaded model
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

### AI Chatbot Integration

The application features an intelligent chatbot powered by LM Studio:

**LM Studio Mode (when connected):**
- Real AI responses using locally-run language models
- Context-aware conversations with memory of previous messages
- Adapts personality based on interface mode (pager/fax)
- Maintains retro aesthetic in responses
- Supports natural language queries and commands

**Fallback Mode (when LM Studio is offline):**
- Automatic fallback to simulated responses
- Command recognition for: HELP, STATUS, INFO, TIME, WEATHER
- System status indicators show "LM STUDIO OFFLINE"

**How to Enable LM Studio:**
1. Install and run LM Studio (download from [lmstudio.ai](https://lmstudio.ai))
2. Load any compatible model (e.g., `qwen2.5-7b-instruct`)
3. Start the application - it will automatically connect to the currently loaded model
4. Look for "✓ Connected to LM Studio" in browser console

**Chatbot Commands:**
Simply type naturally or use these commands:
- **HELP** - Display available commands
- **STATUS** - Show device and connection status
- **INFO** - Display application information
- **TIME** - Show current time
- **WEATHER** - Display weather information

The AI chatbot maintains conversation history (last 20 messages) for coherent multi-turn conversations.

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

## Development Tools

### Proxy Configuration

The application uses a Vite development proxy to enable browser connections to LM Studio:

**Configuration** (`vite.config.ts`):
```javascript
server: {
  proxy: {
    '/lmstudio': {
      target: 'http://127.0.0.1:1234',  // LM Studio default port
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/lmstudio/, ''),
      ws: true,  // WebSocket support for streaming
    }
  }
}
```

This proxy:
- Routes browser requests from `/lmstudio` to LM Studio's local server
- Avoids CORS issues when connecting from the browser
- Supports WebSocket connections for real-time streaming
- Only active in development mode (`npm run dev`)

### Examples

The `examples/` directory contains working code samples:

**LLM Chatbot Example** (`examples/llm-chatbot-example.js`):
```bash
node examples/llm-chatbot-example.js
```

Demonstrates:
- Connecting to LM Studio
- Generating responses in pager and fax modes
- Handling offline fallback
- Managing conversation history
- Checking connection status

### Linting

The project uses ESLint with TypeScript support for code quality:

```bash
# ESLint is configured to support both JavaScript and TypeScript files
# Configuration includes React Hooks rules and React Refresh plugin
```

**ESLint Configuration:**
- TypeScript ESLint parser and rules
- React Hooks recommended rules
- React Refresh for Vite HMR
- Custom rule: Unused variables starting with uppercase or underscore are allowed

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Testing

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

## LM Studio Integration

### Overview

Retro Messenger integrates with **LM Studio** to provide real AI-powered chatbot responses using locally-run language models. This integration demonstrates how modern LLM technology can be wrapped in nostalgic retro interfaces.

### Features

- **Automatic Connection**: Connects to LM Studio on application startup
- **Graceful Fallback**: Continues working with simulated responses if LM Studio is unavailable
- **Context Awareness**: Maintains conversation history for coherent multi-turn dialogues
- **Mode-Specific Behavior**: AI adapts responses based on pager/fax interface mode
- **Optimized for Retro**: Responses limited to 150 tokens for concise, display-appropriate output
- **Streaming Responses**: Real-time token streaming for responsive user experience

### Quick Start Example

Try the included example to see the LLM chatbot in action:

```bash
# Make sure LM Studio is running with a model loaded
node examples/llm-chatbot-example.js
```

This example demonstrates:
- Connecting to LM Studio
- Generating AI responses in both pager and fax modes
- Handling connection failures with graceful fallback
- Managing conversation history
- Checking connection status

### Setup Instructions

1. **Install LM Studio**:
   ```bash
   # Download from https://lmstudio.ai
   # Available for Windows, macOS, and Linux
   ```

2. **Download a Compatible Model**:
   ```bash
   # Example: Qwen2.5-7B-Instruct (recommended)
   lms get qwen2.5-7b-instruct
   ```

3. **Load the Model**:
   ```bash
   lms load qwen2.5-7b-instruct
   ```

4. **Start Retro Messenger**:
   ```bash
   npm run dev
   ```

5. **Verify Connection**:
   - Open browser console (F12)
   - Look for connection messages:
     - `Attempting to connect to LM Studio...`
     - `Requesting model from LM Studio...`
     - `✓ Connected to LM Studio`
     - `✓ Using model: [Model Name]`
   - If connection fails, detailed error messages will guide you to the solution
   - Send a message and receive AI-powered response

### Technical Details

**Service Architecture** (`src/services/LLMChatbotService.js`):
- Singleton service managing LM Studio connection
- **Browser-Compatible Proxy**: Uses `/lmstudio` proxy URL for browser compatibility
- **Flexible Model Loading**: Uses currently loaded model in LM Studio (no hardcoded model requirement)
- **Enhanced Error Diagnostics**: Detailed error messages with actionable troubleshooting steps
- **Connection Logging**: Verbose logging shows connection status and model information
- Automatic reconnection handling
- Conversation history management (last 20 messages)
- Mode-aware system prompts
- Fallback response system

**Configuration**:
- **Max Tokens**: 150 (optimized for retro display)
- **Temperature**: 0.7 (balanced creativity)
- **Stop Strings**: Multiple newlines to prevent verbose output
- **History Limit**: 20 messages + system prompt

**System Prompts**:
The AI receives context-specific instructions based on interface mode:
- Pager mode: Responds as a 1990s pager device assistant
- Fax mode: Responds as a 1980s fax machine assistant
- Maintains retro aesthetic with occasional ALL CAPS emphasis
- Supports command recognition (HELP, STATUS, INFO, TIME, WEATHER)

### API Reference

```javascript
import { llmChatbot } from './services/LLMChatbotService';

// Connect to LM Studio
await llmChatbot.connect();

// Set interface mode (affects system prompt)
llmChatbot.setMode('pager'); // or 'fax'

// Generate AI response
const response = await llmChatbot.generateResponse('Hello!');

// Check connection status
const isConnected = llmChatbot.isLLMConnected();

// Clear conversation history
llmChatbot.clearHistory();

// Disconnect
await llmChatbot.disconnect();
```

**See the complete working example**: `examples/llm-chatbot-example.js`

### Troubleshooting

**Connection fails on startup**:
- The application provides **detailed error diagnostics** with actionable solutions in the browser console
- Check console for specific error messages and follow the provided solutions:
  - `"No models are loaded"` → **Solution provided**: Step-by-step guide to load a model in LM Studio
  - `"ECONNREFUSED"`, `"Failed to fetch"`, or `"NetworkError"` → **Solution provided**: 5-step checklist to enable LM Studio server
  - Other errors → **Troubleshooting guide provided**: General checklist for common issues
- **Enhanced connection logging**: Console shows detailed progress with emoji indicators:
  - 🔌 Attempting to connect...
  - 📍 Using base URL...
  - 🔍 Checking for loaded models...
  - 📊 Found X loaded model(s)
  - 🎯 Requesting model...
  - ✅ Connected successfully
  - 🤖 Using model: [Model Name]
- The app uses a proxy URL (`/lmstudio`) for browser compatibility
- Check that no firewall is blocking local connections

**Slow responses**:
- Response time depends on the model size and your hardware
- Larger models (7B+ parameters) may require significant resources
- Ensure sufficient GPU/CPU resources available
- Check LM Studio performance settings
- Consider GPU offloading settings in LM Studio for better performance

**Responses don't match retro aesthetic**:
- The system prompt guides the AI's tone
- Responses are automatically limited to 150 tokens
- Mode switching updates the system prompt context

**Fallback mode activating unexpectedly**:
- Check browser console for connection errors
- Verify LM Studio server is running
- Try reloading the page to reconnect

## Architecture

### Frontend (React)
- **React 18** with hooks (useState, useEffect, useRef) for state management
- **Vite** for fast development and optimized builds
- **TypeScript** support configured for future migration
- **ESLint** with TypeScript rules for code quality
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

**AI Chatbot Engine:**
- **LM Studio Integration**: Real-time connection to local LLM via `@lmstudio/sdk`
- **Intelligent Responses**: Context-aware AI responses using loaded language models
- **Conversation Memory**: Maintains last 20 messages for coherent dialogues
- **Mode-Aware Prompts**: System prompts adapt to pager/fax interface context
- **Fallback System**: Automatic fallback to pattern-matching when LM Studio unavailable
- **Response Optimization**: 150-token limit for concise, retro-appropriate responses
- **Temperature Control**: Set to 0.7 for balanced creativity and coherence
- **Streaming Support**: Real-time token streaming for responsive feel

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
- **Check LM Studio connection**: Ensure LM Studio is running with any compatible model loaded
- **Look for connection status**: Check browser console for "✓ Connected to LM Studio"
- **Fallback mode**: If LM Studio is offline, chatbot uses simulated responses
- **Wait for response**: AI responses may take a few seconds to generate depending on model size
- **Try commands**: Send "HELP" or "STATUS" to test chatbot functionality
- **Restart LM Studio**: If connection fails, restart LM Studio and reload the page
- **Load a model**: Ensure you have a model loaded in LM Studio (e.g., `lms load qwen2.5-7b-instruct`)

### LM Studio connection issues
- **Enhanced diagnostics**: The service now provides detailed error messages with actionable solutions
- **Improved error detection**: Service checks for loaded models before attempting connection
- **Common error messages**:
  - `"No models are loaded"` → **Detailed solution**: 4-step guide to load a model in LM Studio
  - `"ECONNREFUSED"`, `"Failed to fetch"`, or `"NetworkError"` → **Detailed solution**: 5-step checklist including server enablement and port verification
  - Generic errors → **Comprehensive troubleshooting**: 4-point checklist for common issues
- **Visual progress indicators**: Console shows connection progress with emoji indicators (🔌 📍 🔍 📊 🎯 ✅ 🤖)
- **Model verification**: Service lists loaded models and confirms connection before proceeding
- **Check console**: Look for detailed error messages and follow the provided solutions
- **Fallback works**: Application continues to function with simulated responses when LM Studio is unavailable

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
- **Cloud-hosted LLM APIs** (OpenAI, Anthropic, etc.) for production AI chatbot
- **Production LM Studio Setup**: Configure a backend proxy server for LM Studio connections (the Vite dev proxy only works in development)
- User authentication and multi-user support
- Message encryption and security features
- Webhook retry logic and failure handling
- Rate limiting for incoming webhook requests
- LLM response caching for improved performance
- Fine-tuned models for domain-specific conversations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Developer Notes

### LLM Integration Implementation

The LM Studio integration is implemented in `src/services/LLMChatbotService.js`:

**Key Methods**:
- `connect()` - Establishes connection to LM Studio
- `generateResponse(message)` - Generates AI response with streaming
- `setMode(mode)` - Updates system prompt based on interface mode
- `clearHistory()` - Resets conversation history
- `isLLMConnected()` - Returns connection status

**Integration Points**:
- Import: `import { llmChatbot } from './services/LLMChatbotService'`
- Initialize on component mount with `llmChatbot.connect()`
- Call `llmChatbot.generateResponse(userMessage)` for AI responses
- Update mode with `llmChatbot.setMode('pager')` or `llmChatbot.setMode('fax')`

**Configuration**:
- Max tokens: 150 (configurable in service)
- Temperature: 0.7 (configurable in service)
- History limit: 20 messages (configurable in service)
- System prompts: Defined in `setSystemPrompt()` method

### Dependencies

**Core**:
- `@lmstudio/sdk` (^1.5.0) - LM Studio JavaScript SDK
- `react` (^18.3.1) - UI framework
- `vite` (^6.0.1) - Build tool

**Optional**:
- LM Studio desktop application for AI chatbot functionality

## Acknowledgments

Built with nostalgia for the communication devices of yesteryear. 📟📠✨

Powered by [LM Studio](https://lmstudio.ai) for local AI inference.
