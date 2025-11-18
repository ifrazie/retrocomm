import { loadLMStudioClient } from './LLMStudioLoader.js';
import {
    MAX_LLM_TOKENS,
    LLM_TEMPERATURE,
    MAX_CONVERSATION_HISTORY,
    MODE_PAGER,
    MODE_FAX
} from '../utils/constants.js';
import { cleanLLMResponse } from '../utils/cleanLLMResponse.js';
import { logger } from '../utils/logger.js';

// Check if we're in development mode for logging
const isDevelopment = import.meta.env.DEV;

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
    this.currentMode = MODE_PAGER; // Track current interface mode
  }

  /**
   * Initialize connection to LM Studio
   */
  async connect() {
    try {
      if (isDevelopment) {
        logger.info('🔌 Attempting to connect to LM Studio...');
      }
      
      // Lazy load LM Studio SDK to reduce initial bundle size
      const LMStudioClient = await loadLMStudioClient();
      
      // LM Studio SDK requires WebSocket protocol (ws:// or wss://)
      // Convert http:// to ws:// or https:// to wss://
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseUrl = `${protocol}//${window.location.host}/lmstudio`;
      
      if (isDevelopment) {
        logger.info('📍 Using base URL:', baseUrl);
        logger.info('📍 Protocol:', protocol);
      }
      
      this.client = new LMStudioClient({ baseUrl });
      
      if (isDevelopment) {
        logger.info('✅ LMStudioClient created successfully');
        logger.info('🔍 Checking for loaded models...');
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      );
      
      const loadedModels = await Promise.race([
        this.client.llm.listLoaded(),
        timeoutPromise
      ]);
      
      if (isDevelopment) {
        logger.info('📊 Found', loadedModels.length, 'loaded model(s)');
      }
      
      if (loadedModels.length === 0) {
        throw new Error('No models are loaded in LM Studio. Please load a model first.');
      }
      
      // Try to get the currently loaded model
      if (isDevelopment) {
        logger.info('🎯 Requesting model from LM Studio...');
      }
      
      this.model = await this.client.llm.model();
      
      this.isConnected = true;
      
      if (isDevelopment) {
        logger.info('✅ Connected to LM Studio');
        logger.info('🤖 Model loaded successfully');
      }
      
      // Initialize with system prompt
      this.setSystemPrompt();
      
      return true;
    } catch (error) {
      if (isDevelopment) {
        logger.error('❌ Failed to connect to LM Studio');
        logger.error('📝 Error message:', error.message);
        logger.error('🔍 Full error:', error);
        
        // Provide helpful error messages
        if (error.message?.includes('No models are loaded')) {
          logger.error('');
          logger.error('💡 SOLUTION:');
          logger.error('   1. Open LM Studio');
          logger.error('   2. Go to "My Models" tab');
          logger.error('   3. Click "Load" on any model');
          logger.error('   4. Or use CLI: lms load <model-name>');
        } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          logger.error('');
          logger.error('💡 SOLUTION:');
          logger.error('   1. Make sure LM Studio is running');
          logger.error('   2. In LM Studio, go to Developer tab');
          logger.error('   3. Enable "Local Server"');
          logger.error('   4. Check it\'s running on port 1234');
          logger.error('   5. Restart your dev server (npm run dev)');
        } else {
          logger.error('');
          logger.error('💡 TROUBLESHOOTING:');
          logger.error('   • Is LM Studio running?');
          logger.error('   • Is a model loaded?');
          logger.error('   • Is the local server enabled?');
          logger.error('   • Try restarting both LM Studio and this app');
        }
      }
      
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Set system prompt based on current mode
   */
  setSystemPrompt() {
    const systemPrompt = `You are a retro AI assistant integrated into a ${this.currentMode === MODE_PAGER ? 'vintage pager device from the 1990s' : 'classic fax machine from the 1980s'}. 

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
        maxTokens: MAX_LLM_TOKENS, // Keep responses concise for retro feel
        temperature: LLM_TEMPERATURE,
        stopStrings: ['\n\n\n'], // Stop at multiple newlines
      });

      let responseContent = '';
      
      // Stream the response
      try {
        for await (const fragment of prediction) {
          responseContent += fragment.content;
        }
      } catch (streamError) {
        if (isDevelopment) {
          logger.error('Stream error during response generation:', streamError);
        }
        return this.getFallbackResponse(userMessage);
      }

      // Apply token filtering before returning
      let cleanedResponse;
      try {
        cleanedResponse = cleanLLMResponse(responseContent.trim());
        
        if (isDevelopment) {
          // Log if tokens were removed (response changed after cleaning)
          if (cleanedResponse !== responseContent.trim()) {
            logger.info('🧹 Special tokens removed from LLM response');
            logger.info('   Original length:', responseContent.trim().length);
            logger.info('   Cleaned length:', cleanedResponse.length);
          }
        }
      } catch (error) {
        // Graceful degradation: if filtering fails, return original response
        if (isDevelopment) {
          logger.error('⚠️ Error cleaning LLM response:', error);
          logger.error('   Returning unfiltered response');
        }
        cleanedResponse = responseContent.trim();
      }

      // Add assistant response to history (use cleaned version)
      this.conversationHistory.push({
        role: 'assistant',
        content: cleanedResponse
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > MAX_CONVERSATION_HISTORY + 1) { // 1 system + MAX_CONVERSATION_HISTORY messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-MAX_CONVERSATION_HISTORY)
        ];
      }

      return cleanedResponse;
    } catch (error) {
      if (isDevelopment) {
        logger.error('Error generating LLM response:', error);
      }
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

    let response = '[SYSTEM] MESSAGE RECEIVED. LM STUDIO OFFLINE - USING FALLBACK MODE.';
    
    for (const [key, fallbackResponse] of Object.entries(fallbackResponses)) {
      if (messageUpper.includes(key)) {
        response = fallbackResponse;
        break;
      }
    }

    // Apply token filtering to fallback responses for consistency
    try {
      return cleanLLMResponse(response);
    } catch (error) {
      // Graceful degradation: if filtering fails, return original response
      if (isDevelopment) {
        logger.error('⚠️ Error cleaning fallback response:', error);
        logger.error('   Returning unfiltered response');
      }
      return response;
    }
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
      const LMStudioClient = await loadLMStudioClient();
      const testClient = new LMStudioClient();
      const models = await testClient.llm.listLoaded();
      
      if (isDevelopment) {
        logger.info('✓ LM Studio is reachable');
        logger.info('Loaded models:', models.length);
      }
      
      if (models.length === 0) {
        if (isDevelopment) {
          logger.warn('⚠ No models are currently loaded in LM Studio');
        }
        return false;
      }
      return true;
    } catch (error) {
      if (isDevelopment) {
        logger.error('✗ Cannot reach LM Studio:', error.message);
      }
      return false;
    }
  }

  /**
   * Disconnect from LM Studio
   */
  async disconnect() {
    if (this.model) {
      try {
        // Note: We don't unload the model to preserve it for other sessions
        // If needed in the future, uncomment: await this.model.unload();
      } catch (error) {
        if (isDevelopment) {
          logger.error('Error disconnecting:', error);
        }
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
