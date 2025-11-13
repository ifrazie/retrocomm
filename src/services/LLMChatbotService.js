import { LMStudioClient } from "@lmstudio/sdk";

/**
 * LLM-powered chatbot service using LM Studio
 * Replaces the simulated chatbot with real AI responses
 */
class LLMChatbotService {
  constructor() {
    this.client = null;
    this.model = null;
    this.conversationHistory = [];
    this.isConnected = false;
    this.currentMode = 'pager'; // Track current interface mode
  }

  /**
   * Initialize connection to LM Studio
   */
  async connect() {
    try {
      console.log('🔌 Attempting to connect to LM Studio...');
      
      // Use WebSocket URL for LM Studio connection
      // Convert http:// to ws:// or https:// to wss://
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = `${protocol}//${window.location.host}/lmstudio`;
      console.log('📍 Using base URL:', baseUrl);
      
      this.client = new LMStudioClient({ baseUrl });
      
      // First, try to list loaded models to verify connection
      console.log('🔍 Checking for loaded models...');
      const loadedModels = await this.client.llm.listLoaded();
      console.log('📊 Found', loadedModels.length, 'loaded model(s)');
      
      if (loadedModels.length === 0) {
        throw new Error('No models are loaded in LM Studio. Please load a model first.');
      }
      
      // Try to get the currently loaded model
      console.log('🎯 Requesting model from LM Studio...');
      this.model = await this.client.llm.model();
      
      this.isConnected = true;
      
      console.log('✅ Connected to LM Studio');
      console.log('🤖 Model loaded successfully');
      
      // Initialize with system prompt
      this.setSystemPrompt();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to LM Studio');
      console.error('📝 Error message:', error.message);
      console.error('🔍 Full error:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('No models are loaded')) {
        console.error('');
        console.error('💡 SOLUTION:');
        console.error('   1. Open LM Studio');
        console.error('   2. Go to "My Models" tab');
        console.error('   3. Click "Load" on any model');
        console.error('   4. Or use CLI: lms load <model-name>');
      } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.error('');
        console.error('💡 SOLUTION:');
        console.error('   1. Make sure LM Studio is running');
        console.error('   2. In LM Studio, go to Developer tab');
        console.error('   3. Enable "Local Server"');
        console.error('   4. Check it\'s running on port 1234');
        console.error('   5. Restart your dev server (npm run dev)');
      } else {
        console.error('');
        console.error('💡 TROUBLESHOOTING:');
        console.error('   • Is LM Studio running?');
        console.error('   • Is a model loaded?');
        console.error('   • Is the local server enabled?');
        console.error('   • Try restarting both LM Studio and this app');
      }
      
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Set system prompt based on current mode
   */
  setSystemPrompt() {
    const systemPrompt = `You are a retro AI assistant integrated into a ${this.currentMode === 'pager' ? 'vintage pager device from the 1990s' : 'classic fax machine from the 1980s'}. 

Your responses should:
- Be concise and fit the retro aesthetic
- Use ALL CAPS for emphasis occasionally
- Reference the device context (pager/fax) when appropriate
- Provide helpful information in a nostalgic, terminal-style format
- Support commands like: HELP, STATUS, INFO, TIME, WEATHER
- Be friendly but maintain the retro tech vibe

Current device mode: ${this.currentMode.toUpperCase()}`;

    this.conversationHistory = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
  }

  /**
   * Update the mode context (pager or fax)
   */
  setMode(mode) {
    this.currentMode = mode;
    this.setSystemPrompt();
  }

  /**
   * Generate a response to user message
   * @param {string} userMessage - The user's input message
   * @returns {Promise<string>} The generated response text
   */
  async generateResponse(userMessage) {
    if (!this.isConnected || !this.model) {
      // Fallback to simple responses if not connected
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Generate response using LLM
      const prediction = this.model.respond(this.conversationHistory, {
        maxTokens: 150, // Keep responses concise for retro feel
        temperature: 0.7,
        stopStrings: ['\n\n\n'], // Stop at multiple newlines
      });

      let responseContent = '';
      
      // Stream the response
      try {
        for await (const fragment of prediction) {
          responseContent += fragment.content;
        }
      } catch (streamError) {
        console.error('Stream error during response generation:', streamError);
        return this.getFallbackResponse(userMessage);
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseContent
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 21) { // 1 system + 20 messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-20)
        ];
      }

      return responseContent.trim();
    } catch (error) {
      console.error('Error generating LLM response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Fallback responses when LLM is unavailable
   */
  getFallbackResponse(userMessage) {
    const messageUpper = userMessage.toUpperCase();
    
    const fallbackResponses = {
      'HELP': '[SYSTEM] AVAILABLE COMMANDS:\nSTATUS - Device status\nINFO - System information\nTIME - Current time\nWEATHER - Weather info\nHELP - This message',
      'STATUS': `[SYSTEM] ${this.currentMode.toUpperCase()} STATUS:\nBATTERY: ${Math.floor(Math.random() * 30) + 70}%\nSIGNAL: ${Math.floor(Math.random() * 5) + 1}/5\nMEMORY: ${Math.floor(Math.random() * 40) + 60}%\nWEBHOOK: CONNECTED`,
      'INFO': `[SYSTEM] RETRO MESSENGER v1.0\nDEVICE: ${this.currentMode.toUpperCase()}\nYEAR: 1994\nMEMORY: 256KB\nAI: LM STUDIO OFFLINE`,
      'TIME': `[SYSTEM] CURRENT TIME:\n${new Date().toLocaleTimeString('en-US', { hour12: false })}`,
      'WEATHER': `[SYSTEM] WEATHER:\nTEMP: ${Math.floor(Math.random() * 20) + 60}°F\nHUMIDITY: ${Math.floor(Math.random() * 40) + 40}%\nCONDITION: CLEAR`,
    };

    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (messageUpper.includes(key)) {
        return response;
      }
    }

    return '[SYSTEM] MESSAGE RECEIVED. LM STUDIO OFFLINE - USING FALLBACK MODE.';
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.setSystemPrompt();
  }

  /**
   * Check if connected to LM Studio
   */
  isLLMConnected() {
    return this.isConnected;
  }

  /**
   * Test connection to LM Studio
   */
  async testConnection() {
    try {
      const testClient = new LMStudioClient();
      const models = await testClient.llm.listLoaded();
      console.log('✓ LM Studio is reachable');
      console.log('Loaded models:', models.length);
      if (models.length === 0) {
        console.warn('⚠ No models are currently loaded in LM Studio');
        return false;
      }
      return true;
    } catch (error) {
      console.error('✗ Cannot reach LM Studio:', error.message);
      return false;
    }
  }

  /**
   * Disconnect from LM Studio
   */
  async disconnect() {
    if (this.model) {
      try {
        // Optionally unload the model if needed
        // await this.model.unload();
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
    this.client = null;
    this.model = null;
    this.isConnected = false;
  }
}

// Export singleton instance
export const llmChatbot = new LLMChatbotService();
export default LLMChatbotService;
