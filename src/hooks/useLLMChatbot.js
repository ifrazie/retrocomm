import { useState, useEffect, useCallback } from 'react';
import { llmChatbot } from '../services/LLMChatbotService';
import { logger } from '../utils/logger';

/**
 * React hook for using the LLM chatbot service
 */
export function useLLMChatbot(mode = 'pager') {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize connection on mount
  useEffect(() => {
    const initializeLLM = async () => {
      setIsInitializing(true);
      const connected = await llmChatbot.connect();
      setIsConnected(connected);
      setIsInitializing(false);
    };

    initializeLLM();

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount to preserve connection
      // llmChatbot.disconnect();
    };
  }, []);

  // Update mode when it changes
  useEffect(() => {
    if (isConnected) {
      llmChatbot.setMode(mode);
    }
  }, [mode, isConnected]);

  /**
   * Generate a response from the LLM
   */
  const generateResponse = useCallback(async (userMessage) => {
    setIsGenerating(true);
    try {
      const response = await llmChatbot.generateResponse(userMessage);
      return response;
    } catch (error) {
      logger.error('Error generating response:', error);
      return '[ERROR] Failed to generate response. Please try again.';
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    llmChatbot.clearHistory();
  }, []);

  /**
   * Reconnect to LM Studio
   */
  const reconnect = useCallback(async () => {
    setIsInitializing(true);
    const connected = await llmChatbot.connect();
    setIsConnected(connected);
    setIsInitializing(false);
    return connected;
  }, []);

  return {
    isConnected,
    isInitializing,
    isGenerating,
    generateResponse,
    clearHistory,
    reconnect,
  };
}

export default useLLMChatbot;
