# LLM Setup Checklist ✓

Use this checklist to verify your LLM integration is working correctly.

## Prerequisites

- [ ] **LM Studio installed** - Download from [lmstudio.ai](https://lmstudio.ai)
- [ ] **Node.js installed** - Version 16 or higher
- [ ] **Git repository cloned** - `git clone <repo-url>`
- [ ] **Dependencies installed** - Run `npm install`

## LM Studio Setup

- [ ] **LM Studio is running** - Open the application
- [ ] **Model downloaded** - Use "Discover" tab or CLI: `lms get qwen/qwen3-4b-2507`
- [ ] **Model loaded** - Click "Load" in "My Models" tab or CLI: `lms load qwen/qwen3-4b-2507`
- [ ] **Server is active** - Check LM Studio shows "Server Running" status

## Application Setup

- [ ] **Development server started** - Run `npm run dev`
- [ ] **Browser opened** - Navigate to http://localhost:5173
- [ ] **No console errors** - Check browser developer console (F12)

## Visual Verification

### Pager Mode
- [ ] **Status shows "LLM: ONLINE"** - Look at bottom status bar
- [ ] **Green indicator visible** - Connection indicator is green
- [ ] **No "OFFLINE" message** - Status should not show offline

### Fax Mode
- [ ] **Status shows "LLM: ONLINE"** - Look at bottom status bar
- [ ] **Mode switch works** - Toggle between pager and fax
- [ ] **Status persists** - LLM status remains after mode switch

### Settings Modal
- [ ] **Open settings** - Click "⚙ MENU" button
- [ ] **LLM status visible** - See "🤖 LLM Status" section
- [ ] **Shows "✓ Connected to LM Studio"** - Green checkmark visible
- [ ] **No error messages** - No red warnings about LM Studio

## Functional Testing

### Basic Messaging
- [ ] **Type a message** - Enter "Hello!" in input field
- [ ] **Click SEND** - Message appears in chat
- [ ] **Bot responds** - Wait 1-4 seconds for response
- [ ] **Response is unique** - Not a canned response
- [ ] **Typing indicator shows** - "[LLM] GENERATING..." appears

### Command Testing
Test each command and verify responses:

- [ ] **HELP command** - Type "HELP" → Get command list
- [ ] **STATUS command** - Type "STATUS" → Get device status
- [ ] **TIME command** - Type "TIME" → Get current time
- [ ] **WEATHER command** - Type "WEATHER" → Get weather info
- [ ] **INFO command** - Type "INFO" → Get system info

### Context Testing
- [ ] **Send first message** - "My name is Alice"
- [ ] **Send follow-up** - "What's my name?"
- [ ] **Bot remembers** - Response mentions "Alice"
- [ ] **Conversation flows** - Responses are contextually relevant

### Mode Awareness Testing
- [ ] **In Pager mode** - Send "What device am I using?"
- [ ] **Bot mentions pager** - Response references pager/beeper
- [ ] **Switch to Fax mode** - Toggle mode
- [ ] **Send same question** - "What device am I using?"
- [ ] **Bot mentions fax** - Response references fax machine

## Error Handling

### Offline Mode
- [ ] **Stop LM Studio** - Close the application
- [ ] **Refresh browser** - Reload the page
- [ ] **Status shows "LLM: OFFLINE"** - Red indicator
- [ ] **Send message** - Type and send
- [ ] **Fallback works** - Get simple response
- [ ] **No crashes** - App continues working

### Recovery
- [ ] **Restart LM Studio** - Open and load model
- [ ] **Refresh browser** - Reload the page
- [ ] **Status shows "LLM: ONLINE"** - Green indicator
- [ ] **Send message** - Verify AI responses work again

## Performance Testing

### Response Time
- [ ] **First response** - Note time (should be 1-4 seconds)
- [ ] **Subsequent responses** - Should be similar speed
- [ ] **No timeouts** - Responses always arrive
- [ ] **UI remains responsive** - Can still interact during generation

### Memory Usage
- [ ] **Send 10 messages** - Have a conversation
- [ ] **Check browser memory** - Open Task Manager/Activity Monitor
- [ ] **No memory leaks** - Memory usage stable
- [ ] **History maintained** - Bot remembers context

## Browser Compatibility

Test in multiple browsers:

- [ ] **Chrome/Edge** - Works correctly
- [ ] **Firefox** - Works correctly
- [ ] **Safari** - Works correctly (Mac only)

## Mobile Testing (Optional)

- [ ] **Open on mobile** - Use phone browser
- [ ] **Responsive layout** - UI adapts to screen
- [ ] **LLM works** - Can send/receive messages
- [ ] **Status visible** - Can see connection status

## Advanced Verification

### Console Logs
Open browser console (F12) and verify:

- [ ] **Connection progress indicators** - See emoji indicators (🔌 📍 🔍 📊 🎯)
- [ ] **"✅ Connected to LM Studio"** - Appears on startup
- [ ] **"🤖 Using model: [Model Name]"** - Shows loaded model
- [ ] **No error messages** - No red errors (or follow provided solutions if present)
- [ ] **No warnings** - No yellow warnings about LLM

### Network Tab
- [ ] **Open Network tab** - In browser dev tools
- [ ] **Send message** - Watch network activity
- [ ] **WebSocket connection** - See LM Studio connection
- [ ] **No failed requests** - All requests succeed

### Example Script
Run the example to verify programmatic usage:

- [ ] **Run example** - `npm run example:llm`
- [ ] **See output** - Example conversations print
- [ ] **No errors** - Script completes successfully

## Documentation Review

- [ ] **Read QUICKSTART_LLM.md** - Understand setup
- [ ] **Read docs/LLM_INTEGRATION.md** - Understand architecture
- [ ] **Read LLM_INTEGRATION_SUMMARY.md** - Understand features
- [ ] **Read MIGRATION_GUIDE.md** - Understand changes

## Troubleshooting

If any checks fail, consult:

1. **QUICKSTART_LLM.md** - Setup instructions
2. **docs/LLM_INTEGRATION.md** - Troubleshooting section
3. **Browser console** - Check for error messages
4. **LM Studio logs** - Check LM Studio console

## Common Issues & Solutions

### ❌ "LLM: OFFLINE" always shows
**Solution**: 
1. **Check browser console** for detailed error diagnostics
2. Follow the specific solution provided for your error:
   - "No models are loaded" → Follow 4-step guide in console
   - "ECONNREFUSED"/"NetworkError" → Follow 5-step checklist in console
3. Look for emoji indicators showing connection progress (🔌 📍 🔍 📊 🎯 ✅ 🤖)
4. Verify LM Studio is running with a model loaded
5. Restart both LM Studio and the app

### ❌ Slow responses (>10 seconds)
**Solution**:
1. Use a smaller model (3-4B parameters)
2. Enable GPU acceleration in LM Studio
3. Reduce `maxTokens` in configuration

### ❌ Generic/repetitive responses
**Solution**:
1. Try a larger model (7B+ parameters)
2. Increase `temperature` setting
3. Verify conversation history is working

### ❌ App crashes on startup
**Solution**:
1. Check `@lmstudio/sdk` is installed: `npm list @lmstudio/sdk`
2. Reinstall dependencies: `npm install`
3. Check Node.js version: `node --version` (should be 16+)

## Success Criteria

Your integration is successful if:

✅ **All checkboxes above are checked**
✅ **LLM status shows "ONLINE"**
✅ **Bot provides intelligent, unique responses**
✅ **Bot remembers conversation context**
✅ **Bot adapts to pager/fax mode**
✅ **Fallback works when offline**
✅ **No errors in console**
✅ **Performance is acceptable**

## Next Steps

Once all checks pass:

1. ✨ **Experiment** - Try different models and settings
2. 📝 **Customize** - Modify system prompts for your use case
3. 🎨 **Enhance** - Add new features or commands
4. 🚀 **Deploy** - Build for production: `npm run build`
5. 📊 **Monitor** - Track performance and user feedback

## Support

Need help? Check these resources:

- **Quick Start**: `QUICKSTART_LLM.md`
- **Technical Docs**: `docs/LLM_INTEGRATION.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`
- **LM Studio Docs**: https://lmstudio.ai/docs
- **GitHub Issues**: Report bugs in the repository

---

**All checks passed?** Congratulations! Your LLM integration is working perfectly! 🎉

**Some checks failed?** Don't worry! Review the troubleshooting section and documentation. Most issues are quick to resolve.
