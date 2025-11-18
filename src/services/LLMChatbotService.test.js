import { describe, it, expect, beforeEach, vi } from 'vitest';
import LLMChatbotService from './LLMChatbotService';

describe('LLMChatbotService', () => {
  let service;

  beforeEach(() => {
    service = new LLMChatbotService();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(service.isConnected).toBe(false);
      expect(service.currentMode).toBe('pager');
      expect(service.conversationHistory).toEqual([]);
    });
  });

  describe('Mode Management', () => {
    it('should set mode to pager', () => {
      service.setMode('pager');
      expect(service.currentMode).toBe('pager');
      expect(service.conversationHistory.length).toBeGreaterThan(0);
      expect(service.conversationHistory[0].role).toBe('system');
    });

    it('should set mode to fax', () => {
      service.setMode('fax');
      expect(service.currentMode).toBe('fax');
      expect(service.conversationHistory[0].content).toContain('fax machine');
    });

    it('should update system prompt when mode changes', () => {
      service.setMode('pager');
      const pagerPrompt = service.conversationHistory[0].content;
      
      service.setMode('fax');
      const faxPrompt = service.conversationHistory[0].content;
      
      expect(pagerPrompt).not.toBe(faxPrompt);
      expect(pagerPrompt).toContain('pager');
      expect(faxPrompt).toContain('fax');
    });
  });

  describe('Fallback Responses', () => {
    it('should return HELP response', () => {
      const response = service.getFallbackResponse('HELP');
      expect(response).toContain('AVAILABLE COMMANDS');
      expect(response).toContain('STATUS');
    });

    it('should return STATUS response', () => {
      const response = service.getFallbackResponse('STATUS');
      expect(response).toContain('BATTERY');
      expect(response).toContain('SIGNAL');
    });

    it('should return INFO response', () => {
      const response = service.getFallbackResponse('INFO');
      expect(response).toContain('RETRO MESSENGER');
      expect(response).toContain('v1.0');
    });

    it('should return TIME response', () => {
      const response = service.getFallbackResponse('TIME');
      expect(response).toContain('CURRENT TIME');
    });

    it('should return WEATHER response', () => {
      const response = service.getFallbackResponse('WEATHER');
      expect(response).toContain('WEATHER');
      expect(response).toContain('TEMP');
    });

    it('should return default response for unknown commands', () => {
      const response = service.getFallbackResponse('random message');
      expect(response).toContain('MESSAGE RECEIVED');
    });

    it('should be case insensitive', () => {
      const response1 = service.getFallbackResponse('help');
      const response2 = service.getFallbackResponse('HELP');
      const response3 = service.getFallbackResponse('HeLp');
      
      expect(response1).toBe(response2);
      expect(response2).toBe(response3);
    });
  });

  describe('History Management', () => {
    it('should clear history and reset system prompt', () => {
      service.conversationHistory = [
        { role: 'system', content: 'test' },
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' }
      ];
      
      service.clearHistory();
      
      expect(service.conversationHistory.length).toBe(1);
      expect(service.conversationHistory[0].role).toBe('system');
    });
  });

  describe('Connection Status', () => {
    it('should report disconnected initially', () => {
      expect(service.isLLMConnected()).toBe(false);
    });

    it('should report connected after successful connection', async () => {
      // Mock successful connection
      service.isConnected = true;
      expect(service.isLLMConnected()).toBe(true);
    });
  });

  describe('System Prompt Generation', () => {
    it('should include mode in system prompt', () => {
      service.setMode('pager');
      const prompt = service.conversationHistory[0].content;
      expect(prompt).toContain('PAGER');
    });

    it('should include retro guidelines', () => {
      service.setSystemPrompt();
      const prompt = service.conversationHistory[0].content;
      expect(prompt).toContain('retro');
      expect(prompt).toContain('ALL CAPS');
    });

    it('should list supported commands', () => {
      service.setSystemPrompt();
      const prompt = service.conversationHistory[0].content;
      expect(prompt).toContain('HELP');
      expect(prompt).toContain('STATUS');
      expect(prompt).toContain('TIME');
    });
  });
});
