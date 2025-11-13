# LLM Integration Guide

## Overview

Retro Messenger now uses **LM Studio** to power its chatbot with real AI responses instead of simulated ones. The LLM agent has full context about whether messages are sent via pager mode or fax mode, allowing it to provide contextually appropriate responses.

## Prerequisites

1. **Install LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)
2. **Download a Model**: Use the LM Studio UI or CLI to download a model
   ```bash
   lms get qwen/qwen3-4b-2507
   ```
3. **Load the Model**: Either load it in the LM Studio GUI or via CLI
   ```bash
   lms load qwen/qwen3-4b-2507
   ```

## How It Works

### Architecture

```
User Message (Pager/Fax)
    ↓
LLMChatbotService
    ↓
Browser Proxy (/lmstudio → http://127.0.0.1:1234)
    ↓
LM Studio SDK
    ↓
Local LLM Model
    ↓
AI Response (Context-Aware)
    ↓
Display in Retro Interface
```

### Proxy Configuration

The application uses a Vite proxy to enable browser-compatible connections to LM Studio:

**Vite Configuration** (`vite.config.ts`):
```javascript
server: {
  proxy: {
    '/lmstudio': {
      target: 'http://127.0.0.1:1234',  // LM Studio default port
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/lmstudio/, ''),
      ws: true,  // WebSocket support
    }
  }
}
```

**Service Implementation** (`src/services/LLMChatbotService.js`):
```javascript
const baseUrl = window.location.origin + '/lmstudio';
this.client = new LMStudioClient({ baseUrl });
```

This proxy setup:
- Allows the browser to connect to LM Studio without CORS issues
- Routes `/lmstudio/*` requests to `http://127.0.0.1:1234/*`
- Supports WebSocket connections for streaming responses
- Works seamlessly in development mode

### Context Awareness

The LLM agent receives a system prompt that includes:
- Current device mode (pager or fax)
- Retro aesthetic guidelines
- Command recognition capabilities
- Conversation history

Example system prompt:
```
You are a retro AI assistant integrated into a vintage pager device from the 1990s.

Your responses should:
- Be concise and fit the retro aesthetic
- Use ALL CAPS for emphasis occasionally
- Reference the device context (pager/fax) when appropriate
- Provide helpful information in a nostalgic, terminal-style format
- Support commands like: HELP, STATUS, INFO, TIME, WEATHER
- Be friendly but maintain the retro tech vibe

Current device mode: PAGER
```

### Key Features

1. **Browser-Compatible Connection**: Uses proxy URL for seamless browser integration
2. **Enhanced Error Diagnostics**: 
   - Checks for loaded models before attempting connection
   - Provides detailed error messages with step-by-step solutions
   - Visual progress indicators with emoji logging (🔌 📍 🔍 📊 🎯 ✅ 🤖)
   - Specific guidance for each error type (no models, connection issues, etc.)
3. **Mode-Aware Responses**: The LLM knows if you're using pager or fax mode
4. **Conversation History**: Maintains context across multiple messages
5. **Fallback Mode**: If LM Studio is offline, falls back to simple responses
6. **Real-time Status**: Shows LLM connection status in the UI
7. **Streaming Support**: Responses are generated in real-time

## Usage

### Starting the Application

1. **Start LM Studio** and load a model
2. **Start Retro Messenger**:
   ```bash
   npm run dev
   ```
3. The app will automatically connect to LM Studio on startup

### Sending Messages

1. Type your message in the input field
2. Click "SEND" (pager mode) or "TRANSMIT" (fax mode)
3. Watch the LLM generate a response in real-time
4. The status indicator shows: `LLM: ONLINE` when connected

### Status Indicators

- **LLM: INIT...** - Connecting to LM Studio
- **LLM: ONLINE** - Connected and ready
- **LLM: OFFLINE** - Not connected (using fallback mode)
- **[LLM] GENERATING...** - AI is generating a response

## Configuration

### Adjusting Response Length

Edit `src/services/LLMChatbotService.js`:

```javascript
const prediction = this.model.respond(this.conversationHistory, {
  maxTokens: 150, // Increase for longer responses
  temperature: 0.7, // 0.0-1.0, higher = more creative
  stopStrings: ['\n\n\n'],
});
```

### Changing the Model

The service uses whatever model is currently loaded in LM Studio. To use a different model:

1. Load it in LM Studio
2. Restart Retro Messenger (or it will auto-detect)

### Customizing System Prompt

Edit the `setSystemPrompt()` method in `src/services/LLMChatbotService.js` to change how the AI behaves.

## Troubleshooting

### "LLM: OFFLINE" Status

**Problem**: App shows LLM as offline

**Solutions**:
1. **Check browser console first** - The service provides detailed diagnostics with actionable solutions
2. Look for emoji indicators showing connection progress:
   - 🔌 Attempting to connect...
   - 📍 Using base URL...
   - 🔍 Checking for loaded models...
   - 📊 Found X loaded model(s)
   - 🎯 Requesting model...
   - ✅ Connected successfully
   - 🤖 Using model: [Model Name]
3. Follow the specific solution provided for your error:
   - **"No models are loaded"**: 4-step guide to load a model in LM Studio
   - **"ECONNREFUSED", "Failed to fetch", or "NetworkError"**: 5-step checklist including server enablement
   - **Generic errors**: Comprehensive troubleshooting checklist
4. Verify LM Studio is running with a model loaded
5. Enable LM Studio local server (Developer tab → Enable local server)
6. Try restarting both LM Studio and the app

**Enhanced Error Diagnostics**: The service provides comprehensive error messages including:
- **Model verification**: Checks for loaded models before attempting connection
- **Specific error identification**: Distinguishes between no models, connection issues, and other errors
- **Step-by-step solutions**: Actionable instructions for each error type
- **Visual progress indicators**: Emoji-based logging for easy tracking
- **Relevant commands**: Exact LM Studio CLI commands to resolve issues

### Slow Responses

**Problem**: LLM takes a long time to respond

**Solutions**:
1. Use a smaller model (e.g., 3B or 4B parameters)
2. Reduce `maxTokens` in the configuration
3. Ensure your GPU is being utilized (check LM Studio settings)

### Generic Responses

**Problem**: LLM doesn't seem aware of pager/fax context

**Solutions**:
1. Check that mode switching is working (toggle between pager/fax)
2. Verify the system prompt includes mode information
3. Try a more capable model (7B+ parameters recommended)

### Connection Errors

**Problem**: Cannot connect to LM Studio

**Solutions**:
1. Ensure LM Studio's local server is enabled (Developer tab → Enable local server)
2. The app uses a proxy URL (`/lmstudio`) for browser compatibility
3. Check that no firewall is blocking localhost connections
4. Verify LM Studio is running on default port (1234)
5. Check browser console for detailed error messages with troubleshooting steps

## API Reference

### LLMChatbotService

Main service class for LLM integration.

**Methods**:
- `connect()` - Initialize connection to LM Studio
- `generateResponse(message)` - Generate AI response
- `setMode(mode)` - Update context for pager/fax mode
- `clearHistory()` - Reset conversation history
- `disconnect()` - Close connection

### useLLMChatbot Hook

React hook for using the LLM service.

**Returns**:
- `isConnected` - Boolean, true if connected to LM Studio
- `isInitializing` - Boolean, true during initial connection
- `isGenerating` - Boolean, true while generating response
- `generateResponse(message)` - Function to generate response
- `clearHistory()` - Function to clear conversation
- `reconnect()` - Function to reconnect to LM Studio

## Example Interactions

### Pager Mode

**User**: "What time is it?"

**LLM**: "[SYSTEM] CURRENT TIME: 14:32:45
Your RETROPAGER 9000 is functioning normally. BATTERY: 87%"

### Fax Mode

**User**: "Send me a status report"

**LLM**: "━━━━━━━━━━━━━━━━━━━━━━━━
STATUS REPORT - FAX TRANSMISSION
━━━━━━━━━━━━━━━━━━━━━━━━

SYSTEM: OPERATIONAL
LINE: CONNECTED
PAPER: 78% REMAINING
LAST TRANSMISSION: SUCCESSFUL

All systems functioning within normal parameters."

## Advanced Usage

### Multiple Models

You can switch between models in LM Studio without restarting the app. The service will use whichever model is currently loaded.

### Custom Commands

The LLM naturally handles commands like HELP, STATUS, INFO, TIME, and WEATHER. You can add more by updating the system prompt.

### Conversation Memory

The service maintains the last 20 messages in history. Adjust this in `generateResponse()`:

```javascript
if (this.conversationHistory.length > 21) {
  this.conversationHistory = [
    this.conversationHistory[0], // Keep system prompt
    ...this.conversationHistory.slice(-20) // Adjust number here
  ];
}
```

## Performance Tips

1. **Use quantized models**: Q4_K_M or Q5_K_M for best speed/quality balance
2. **Enable GPU acceleration**: Configure in LM Studio settings
3. **Limit context length**: Shorter conversations = faster responses
4. **Choose appropriate model size**: 3-7B models work well for this use case

## Future Enhancements

Possible improvements:
- Voice input/output for retro phone aesthetic
- Multi-turn conversations with memory persistence
- Custom personality profiles per device mode
- Integration with external APIs (weather, time zones, etc.)
- Structured output for formatted responses

## Support

For issues specific to:
- **LM Studio**: Visit [lmstudio.ai/docs](https://lmstudio.ai/docs)
- **Retro Messenger**: Check the main README.md
- **Integration**: Review this document and check browser console logs
