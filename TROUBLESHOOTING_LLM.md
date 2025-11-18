# LLM Connection Troubleshooting

## Current Issue: "LLM: OFFLINE"

### Step-by-Step Diagnosis

#### 1. Check LM Studio is Running
- [ ] Open LM Studio application
- [ ] Verify it's not minimized or closed

#### 2. Check Local Server is Enabled
- [ ] In LM Studio, look for "Developer" or "Local Server" tab
- [ ] Make sure "Enable Local Server" is checked/toggled ON
- [ ] Note the port number (should be 1234 by default)

#### 3. Check a Model is Loaded
- [ ] Go to "My Models" tab in LM Studio
- [ ] Look for a model with "Loaded" status
- [ ] If no model is loaded, click "Load" on any model
- [ ] Wait for it to fully load (progress bar completes)

#### 4. Verify Port Number
If LM Studio is using a different port:

**Option A: Change Vite Config**
Edit `vite.config.ts`:
```typescript
'/lmstudio': {
  target: 'http://127.0.0.1:YOUR_PORT_HERE', // Change 1234 to your port
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/lmstudio/, ''),
  ws: true,
}
```

**Option B: Change LM Studio Port**
- In LM Studio settings, change port to 1234
- Restart LM Studio

#### 5. Restart Everything
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

Then refresh your browser.

#### 6. Check Browser Console
Press F12 and look for:
- ✅ "✅ Connected to LM Studio" = Success!
- ❌ "Failed to fetch" = Server not running
- ❌ "No models are loaded" = Load a model
- ❌ "CORS" error = Proxy not working (restart dev server)

### Common Solutions

#### Solution 1: LM Studio Server Not Enabled
**Problem:** Local server is disabled in LM Studio

**Fix:**
1. Open LM Studio
2. Find "Developer" or "Local Server" section
3. Toggle "Enable Local Server" to ON
4. Restart your browser

#### Solution 2: No Model Loaded
**Problem:** LM Studio is running but no model is loaded

**Fix:**
```bash
# Download a model (if needed)
lms get qwen/qwen3-4b-2507

# Load the model
lms load qwen/qwen3-4b-2507
```

Or use the LM Studio GUI:
1. Go to "My Models"
2. Click "Load" on any model
3. Wait for loading to complete

#### Solution 3: Port Mismatch
**Problem:** LM Studio is using a different port

**Fix:**
1. Check LM Studio's port (usually shown in Developer tab)
2. Update `vite.config.ts` to match that port
3. Restart dev server

#### Solution 4: Proxy Not Working
**Problem:** Vite proxy not routing requests correctly

**Fix:**
1. Make sure you restarted the dev server after changing vite.config.ts
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try hard refresh (Ctrl+Shift+R)

#### Solution 5: Firewall Blocking
**Problem:** Firewall blocking localhost connections

**Fix:**
1. Temporarily disable firewall
2. Or add exception for port 1234 and 5173
3. Check antivirus isn't blocking

### Verification Checklist

Run through this checklist:

- [ ] LM Studio is open and running
- [ ] Local server is enabled in LM Studio
- [ ] A model shows "Loaded" status
- [ ] Port is 1234 (or vite.config.ts matches the port)
- [ ] Dev server was restarted after config changes
- [ ] Browser was refreshed
- [ ] No firewall/antivirus blocking
- [ ] Browser console shows connection attempt

### Still Not Working?

#### Test Direct Connection
Try accessing LM Studio directly in your browser:
```
http://127.0.0.1:1234/lmstudio-greeting
```

**Expected:** Should see a greeting message or JSON response
**If fails:** LM Studio server is not running properly

#### Check Network Tab
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Refresh page
4. Look for requests to `/lmstudio`
5. Check if they're failing and why

#### Alternative: Use Direct Connection (Not Recommended)
If proxy isn't working, you can try direct connection:

Edit `src/services/LLMChatbotService.js`:
```javascript
// Instead of:
const baseUrl = window.location.origin + '/lmstudio';

// Try:
const baseUrl = 'http://127.0.0.1:1234';
```

**Note:** This may cause CORS issues, but worth testing.

### Get More Help

If still stuck, provide:
1. LM Studio version
2. Browser console output (full)
3. LM Studio port number
4. Operating system
5. Screenshot of LM Studio's server settings

### Quick Test Script

Run this in browser console to test connection:
```javascript
fetch('http://localhost:5173/lmstudio/lmstudio-greeting')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

Should return a greeting if proxy is working.
