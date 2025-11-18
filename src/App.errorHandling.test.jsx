import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.jsx';

// Mock the LLM chatbot hook
vi.mock('./hooks/useLLMChatbot', () => ({
  useLLMChatbot: () => ({
    isConnected: false,
    isInitializing: false,
    isGenerating: false,
    generateResponse: vi.fn().mockRejectedValue(new Error('LLM connection failed'))
  })
}));

describe('App Integration Tests - Error Handling', () => {
  let originalEnv;
  let consoleErrorSpy;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
    vi.resetModules();
  });

  it('should handle chatbot errors gracefully', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message to trigger chatbot error
    fireEvent.change(input, { target: { value: 'Test error logging' } });
    fireEvent.click(sendButton);
    
    // Wait for error message to appear (verifies error was caught and handled)
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate response/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify the app continues to function after error
    expect(screen.getByPlaceholderText('Type message...')).toBeInTheDocument();
  });

  it('should suppress errors in production build', async () => {
    process.env.NODE_ENV = 'production';
    
    // Re-import logger with production mode
    vi.resetModules();
    
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message to trigger chatbot error
    fireEvent.change(input, { target: { value: 'Test error suppression' } });
    fireEvent.click(sendButton);
    
    // Wait a bit to ensure error handling completes
    await waitFor(() => {
      expect(screen.getByText(/Test error suppression/)).toBeInTheDocument();
    });
    
    // Wait additional time for error handling
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify error was NOT logged in production
    const errorCalls = consoleErrorSpy.mock.calls.filter(call => 
      call.some(arg => arg === 'Chatbot error:')
    );
    expect(errorCalls.length).toBe(0);
  });

  it('should display error message when chatbot fails', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message to trigger chatbot error
    fireEvent.change(input, { target: { value: 'Trigger error' } });
    fireEvent.click(sendButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate response/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify error message contains expected text
    expect(screen.getByText(/Check LM Studio connection/)).toBeInTheDocument();
  });

  it('should show toast on clipboard failure', async () => {
    // Mock clipboard to fail
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard access denied'))
      },
      writable: true,
      configurable: true
    });
    
    render(<App />);
    
    // Open settings
    const menuButton = screen.getByRole('button', { name: /open settings menu/i });
    fireEvent.click(menuButton);
    
    // Wait for settings modal
    await waitFor(() => {
      expect(screen.getByText(/WEBHOOK CONFIGURATION/)).toBeInTheDocument();
    });
    
    // Click copy button
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to copy URL/)).toBeInTheDocument();
    });
    
    // Verify toast has error styling
    const toastElement = screen.getByText(/Failed to copy URL/).closest('.toast');
    expect(toastElement).toHaveClass('toast-error');
    
    // Restore clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    });
  });

  it('should handle clipboard error gracefully without crashing', async () => {
    // Mock clipboard to fail
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      },
      writable: true,
      configurable: true
    });
    
    render(<App />);
    
    // Open settings
    const menuButton = screen.getByRole('button', { name: /open settings menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText(/WEBHOOK CONFIGURATION/)).toBeInTheDocument();
    });
    
    // Click copy button - should not crash
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    // App should still be functional
    await waitFor(() => {
      expect(screen.getByText(/Failed to copy URL/)).toBeInTheDocument();
    });
    
    // Close settings
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // App should still work
    expect(screen.getByPlaceholderText('Type message...')).toBeInTheDocument();
    
    // Restore clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    });
  });

  it('should handle multiple errors without crashing', async () => {
    // Mock clipboard to fail
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied'))
      },
      writable: true,
      configurable: true
    });
    
    render(<App />);
    
    // Trigger clipboard error
    const menuButton = screen.getByRole('button', { name: /open settings menu/i });
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText(/WEBHOOK CONFIGURATION/)).toBeInTheDocument();
    });
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    // Wait for toast
    await waitFor(() => {
      expect(screen.getByText(/Failed to copy URL/)).toBeInTheDocument();
    });
    
    // Close settings
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    // Now trigger chatbot error
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    fireEvent.change(input, { target: { value: 'Test multiple errors' } });
    fireEvent.click(sendButton);
    
    // Wait for chatbot error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate response/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // App should still be functional after multiple errors
    expect(screen.getByPlaceholderText('Type message...')).toBeInTheDocument();
    
    // Restore clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    });
  });
});
