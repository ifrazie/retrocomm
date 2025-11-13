# Migration Guide: From Simulated to LLM-Powered Chatbot

This guide explains the changes made to integrate LM Studio's LLM capabilities into Retro Messenger.

## Overview of Changes

The chatbot has been upgraded from simple pattern-matching responses to real AI-powered conversations using LM Studio.

## Before (Simulated Chatbot)

### Old Implementation
```javascript
const CHATBOT_RESPONSES = {
    'HELP': 'Available commands: STATUS, INFO, TIME, WEATHER',
    'STATUS': 'All systems operational. Webhook connected.',
    'INFO': 'Retro Messenger v1.0 - AWS Kiro Enabled',
    'TIME': new Date().toLocaleTimeString(),
    'WEATHER': 'Temperature: 72°F, Clear skies',
    'DEFAULT': 'Message received. Processing...'
};

const handleChatbotResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
        setIsTyping(false);
        const messageUpper = userMessage.toUpperCase();
        let response = CHATBOT_RESPONSES.DEFAULT;
        
        Object.keys(CHATBOT_RESPONSES).forEach(key => {
            if (messageUpper.includes(key)) {
                response = CHATBOT_RESPONSES[key];
            }
        });
        
        const botMessage = {
            sender: 'ChatBot',
            content: response,
            timestamp: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            type: 'bot'
        };
        
        setMessages(prev => [...prev, botMessage]);
        setHasNewMessage(true);
    }, 2000);
};
```

### Limitations
- ❌ Fixed, canned responses
- ❌ No conversation context
- ❌ Simple keyword matching
- ❌ No natural language understanding
- ❌ Same response every time

## After (LLM-Powered Chatbot)

### New Implementation

**Service Layer** (`src/services/LLMChatbotService.js`):
```javascript
import { LMStudioClient } from "@lmstudio/sdk";

class LLMChatbotService {
  async connect() {
    this.client = new LMStudioClient();
    this.model = await this.client.llm.model();
    this.isConnected = true;
  }
  
  async generateResponse(userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });
    
    const prediction = this.model.respond(this.conversationHistory, {
      maxTokens: 150,
      temperature: 0.7,
    });
    
    let responseContent = '';
    for await (const fragment of prediction) {
      responseContent += fragment.content;
    }
    
    this.conversationHistory.push({
      role: 'assistant',
      content: responseContent
    });
    
    return responseContent.trim();
  }
}
```

**React Hook** (`src/hooks/useLLMChatbot.js`):
```javascript
export function useLLMChatbot(mode = 'pager') {
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const initializeLLM = async () => {
      const connected = await llmChatbot.connect();
      setIsConnected(connected);
    };
    initializeLLM();
  }, []);
  
  const generateResponse = useCallback(async (userMessage) => {
    setIsGenerating(true);
    const response = await llmChatbot.generateResponse(userMessage);
    setIsGenerating(false);
    return response;
  }, []);
  
  return { isConnected, isGenerating, generateResponse };
}
```

**Component Usage** (`src/App.jsx`):
```javascript
function App() {
  const { 
    isConnected: llmConnected, 
    isGenerating: llmGenerating, 
    generateResponse 
  } = useLLMChatbot(mode);
  
  const handleChatbotResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      const response = await generateResponse(userMessage);
      setIsTyping(false);
      
      const botMessage = {
        sender: 'ChatBot',
        content: response,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setHasNewMessage(true);
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
    }
  };
}
```

### Improvements
- ✅ Real AI-powered responses
- ✅ Conversation context and memory
- ✅ Natural language understanding
- ✅ Unique responses every time
- ✅ Mode-aware (pager vs fax)
- ✅ Graceful fallback when offline
- ✅ Configurable behavior

## Key Differences

### 1. Response Generation

**Before**: Instant, synchronous lookup
```javascript
let response = CHATBOT_RESPONSES.DEFAULT;
```

**After**: Async AI generation
```javascript
const response = await generateResponse(userMessage);
```

### 2. Context Awareness

**Before**: No context, each message independent
```javascript
// No history tracking
```

**After**: Full conversation history
```javascript
this.conversationHistory = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi there!' },
  // ... continues
];
```

### 3. Mode Awareness

**Before**: No awareness of pager vs fax mode
```javascript
// Same responses regardless of mode
```

**After**: System prompt adapts to mode
```javascript
const systemPrompt = `You are integrated into a ${mode === 'pager' ? 'vintage pager' : 'classic fax machine'}...`;
```

### 4. Error Handling

**Before**: No error handling needed
```javascript
// Simple synchronous code
```

**After**: Comprehensive error handling
```javascript
try {
  const response = await generateResponse(userMessage);
} catch (error) {
  // Fallback to simple responses
  const errorMessage = { /* ... */ };
}
```

### 5. Status Indicators

**Before**: Simple "WEBHOOK: CONNECTED"
```javascript
<span>WEBHOOK: CONNECTED | AWS KIRO ACTIVE</span>
```

**After**: LLM status included
```javascript
<span>WEBHOOK: CONNECTED | LLM: {llmConnected ? 'ONLINE' : 'OFFLINE'}</span>
```

## Migration Steps

If you're updating an existing installation:

### Step 1: Install Dependencies
```bash
npm install @lmstudio/sdk
```

### Step 2: Add New Files
- `src/services/LLMChatbotService.js`
- `src/hooks/useLLMChatbot.js`

### Step 3: Update App.jsx
- Import `useLLMChatbot` hook
- Remove `CHATBOT_RESPONSES` constant
- Update `handleChatbotResponse()` to async
- Add LLM status indicators

### Step 4: Update Styling
Add to `src/App.css`:
```css
.llm-status-indicator.connected {
  background-color: rgba(0, 255, 65, 0.1);
  border: 2px solid #00ff41;
  color: #00ff41;
}
```

### Step 5: Test
1. Start LM Studio and load a model
2. Run `npm run dev`
3. Verify "LLM: ONLINE" appears
4. Send test messages

## Backward Compatibility

The new implementation maintains backward compatibility:

- **Fallback Mode**: If LM Studio is offline, the app uses simple pattern-matched responses similar to the old implementation
- **Same UI**: No breaking changes to the user interface
- **Same API**: Component interfaces remain consistent

## Performance Considerations

### Old Implementation
- ⚡ Instant responses (0ms)
- 💾 Minimal memory usage
- 🔋 No external dependencies

### New Implementation
- ⏱️ 1-4 second responses (model dependent)
- 💾 Higher memory usage (model loaded)
- 🔌 Requires LM Studio running
- 🎯 Much better quality responses

## Configuration Options

### Adjust Response Speed
```javascript
// Faster but shorter responses
maxTokens: 50

// Slower but longer responses
maxTokens: 300
```

### Adjust Creativity
```javascript
// More deterministic
temperature: 0.3

// More creative
temperature: 0.9
```

### Adjust History Length
```javascript
// Keep more context (slower)
if (this.conversationHistory.length > 41) { ... }

// Keep less context (faster)
if (this.conversationHistory.length > 11) { ... }
```

## Rollback Instructions

If you need to revert to the simulated chatbot:

1. **Remove the hook import**:
   ```javascript
   // Remove this line
   import { useLLMChatbot } from './hooks/useLLMChatbot';
   ```

2. **Restore CHATBOT_RESPONSES**:
   ```javascript
   const CHATBOT_RESPONSES = {
     'HELP': 'Available commands: STATUS, INFO, TIME, WEATHER',
     // ... etc
   };
   ```

3. **Revert handleChatbotResponse**:
   ```javascript
   const handleChatbotResponse = (userMessage) => {
     // Use old synchronous implementation
   };
   ```

4. **Remove LLM status indicators**:
   ```javascript
   // Change back to
   <span>WEBHOOK: CONNECTED | AWS KIRO ACTIVE</span>
   ```

## Testing Checklist

After migration, verify:

- [ ] App starts without errors
- [ ] LLM status shows correctly
- [ ] Messages send successfully
- [ ] Bot responds (LLM or fallback)
- [ ] Mode switching works
- [ ] Conversation history maintained
- [ ] Settings modal shows LLM status
- [ ] Typing indicators work
- [ ] Error handling works (disconnect LM Studio)

## Common Issues

### Issue: "LLM: OFFLINE" always shows
**Solution**: Make sure LM Studio is running and a model is loaded

### Issue: Responses are too slow
**Solution**: Use a smaller model or reduce maxTokens

### Issue: Responses don't match mode
**Solution**: Verify mode is being passed to useLLMChatbot hook

### Issue: App crashes on startup
**Solution**: Check that @lmstudio/sdk is installed correctly

## Benefits of Migration

1. **Better User Experience**: Natural, intelligent responses
2. **Conversation Context**: Bot remembers previous messages
3. **Flexibility**: Easy to customize behavior
4. **Scalability**: Can integrate with other AI services
5. **Modern Architecture**: Clean separation of concerns

## Next Steps

After successful migration:

1. Experiment with different models
2. Customize system prompts
3. Add more sophisticated error handling
4. Consider adding streaming responses
5. Explore advanced LM Studio features

## Support

For help with migration:
- See `QUICKSTART_LLM.md` for setup
- See `docs/LLM_INTEGRATION.md` for technical details
- Check browser console for errors
- Review LM Studio documentation

---

**Migration completed successfully?** You now have a production-ready AI-powered chatbot! 🎉
