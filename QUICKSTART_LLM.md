# Quick Start: LLM Integration

Get your Retro Messenger chatbot powered by real AI in 3 easy steps!

## Step 1: Install LM Studio

Download and install LM Studio from [lmstudio.ai](https://lmstudio.ai)

## Step 2: Download and Load a Model

### Option A: Using LM Studio GUI
1. Open LM Studio
2. Go to the "Discover" tab
3. Search for "qwen3-4b" or "qwen2.5-7b"
4. Click download
5. Once downloaded, click "Load" in the "My Models" tab

### Option B: Using CLI
```bash
# Download a model
lms get qwen/qwen3-4b-2507

# Load the model
lms load qwen/qwen3-4b-2507
```

**Recommended Models:**
- `qwen/qwen3-4b-2507` - Fast, good quality (4B parameters)
- `qwen2.5-7b-instruct` - Better quality, slower (7B parameters)
- `qwen2.5-0.5b-instruct` - Very fast, basic quality (0.5B parameters)

## Step 3: Start Retro Messenger

```bash
# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Verify It's Working

1. Look for the status indicator: **LLM: ONLINE** (green)
2. Send a test message: "Hello!"
3. Watch the LLM generate a response in real-time
4. Try commands: "HELP", "STATUS", "TIME"

## Troubleshooting

### "LLM: OFFLINE" appears
- **Check browser console** for detailed error diagnostics with solutions
- The service provides specific guidance for each error type:
  - "No models are loaded" → Follow the 4-step solution in console
  - "ECONNREFUSED" or "NetworkError" → Follow the 5-step checklist in console
- Make sure LM Studio is running
- Verify a model is loaded (check LM Studio's "My Models" tab)
- Enable LM Studio local server (Developer tab → Enable local server)
- Look for emoji indicators in console showing connection progress (🔌 📍 🔍 📊 🎯 ✅)
- Restart Retro Messenger

### Responses are slow
- Use a smaller model (3-4B parameters)
- Enable GPU acceleration in LM Studio settings
- Close other applications using GPU

### Generic/simple responses
- The model might be too small - try a 7B model
- Check that the model is fully loaded in LM Studio

## What's Next?

- Switch between **Pager** and **Fax** modes - the AI adapts!
- Have multi-turn conversations - the AI remembers context
- Try different commands and see how the AI responds
- Experiment with different models in LM Studio

For detailed configuration and advanced usage, see [docs/LLM_INTEGRATION.md](docs/LLM_INTEGRATION.md)

---

**Note**: The app works without LM Studio too! It will automatically fall back to simulated responses if LM Studio is not available.
