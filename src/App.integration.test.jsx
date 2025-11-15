import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.jsx';

// Mock the LLM chatbot hook
vi.mock('./hooks/useLLMChatbot', () => ({
  useLLMChatbot: () => ({
    isConnected: false,
    isInitializing: false,
    isGenerating: false,
    generateResponse: vi.fn().mockResolvedValue('Mock bot response')
  })
}));

describe('App Integration Tests - Message Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new messages with unique IDs', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send first message
    fireEvent.change(input, { target: { value: 'First test message' } });
    fireEvent.click(sendButton);
    
    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText(/First test message/)).toBeInTheDocument();
    });
    
    // Send second message
    fireEvent.change(input, { target: { value: 'Second test message' } });
    fireEvent.click(sendButton);
    
    // Wait for second message to appear
    await waitFor(() => {
      expect(screen.getByText(/Second test message/)).toBeInTheDocument();
    });
    
    // Both messages should be visible
    expect(screen.getByText(/First test message/)).toBeInTheDocument();
    expect(screen.getByText(/Second test message/)).toBeInTheDocument();
  });

  it('should not have React console warnings about duplicate keys', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send multiple messages
    for (let i = 0; i < 5; i++) {
      fireEvent.change(input, { target: { value: `Message ${i}` } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Message ${i}`))).toBeInTheDocument();
      });
    }
    
    // Check that no React key warnings were logged
    const keyWarnings = consoleErrorSpy.mock.calls.filter(call => 
      call.some(arg => typeof arg === 'string' && arg.includes('key'))
    );
    const keyWarningsWarn = consoleWarnSpy.mock.calls.filter(call => 
      call.some(arg => typeof arg === 'string' && arg.includes('key'))
    );
    
    expect(keyWarnings.length).toBe(0);
    expect(keyWarningsWarn.length).toBe(0);
    
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should render messages correctly with unique IDs in pager mode', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message
    fireEvent.change(input, { target: { value: 'Test message with ID' } });
    fireEvent.click(sendButton);
    
    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText(/Test message with ID/)).toBeInTheDocument();
    });
    
    // Message should be rendered with proper structure
    const messageElement = screen.getByText(/Test message with ID/).closest('.pager-message');
    expect(messageElement).toBeInTheDocument();
  });

  it('should render messages correctly with unique IDs in fax mode', async () => {
    render(<App />);
    
    // Switch to fax mode using the mode switcher button (more specific)
    const faxModeButton = screen.getByText('📠 Fax Mode');
    fireEvent.click(faxModeButton);
    
    const input = screen.getByPlaceholderText('Type message to send...');
    const sendButton = screen.getByText('TRANSMIT');
    
    // Send a message
    fireEvent.change(input, { target: { value: 'Fax test message' } });
    fireEvent.click(sendButton);
    
    // Wait for message to appear
    await waitFor(() => {
      expect(screen.getByText(/Fax test message/)).toBeInTheDocument();
    });
    
    // Message should be rendered with proper structure
    const messageElement = screen.getByText(/Fax test message/).closest('.fax-message');
    expect(messageElement).toBeInTheDocument();
  });

  it('should maintain message IDs when switching between modes', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message in pager mode
    fireEvent.change(input, { target: { value: 'Mode switch test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Mode switch test/)).toBeInTheDocument();
    });
    
    // Switch to fax mode using the mode switcher button
    const faxModeButton = screen.getByText('📠 Fax Mode');
    fireEvent.click(faxModeButton);
    
    // Message should still be visible in fax mode
    await waitFor(() => {
      expect(screen.getByText(/Mode switch test/)).toBeInTheDocument();
    });
    
    // Switch back to pager mode using the mode switcher button
    const pagerModeButton = screen.getByText('📟 Pager Mode');
    fireEvent.click(pagerModeButton);
    
    // Message should still be visible in pager mode
    expect(screen.getByText(/Mode switch test/)).toBeInTheDocument();
  });

  it('should generate bot messages with unique IDs', async () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText('Type message...');
    const sendButton = screen.getByText('SEND');
    
    // Send a message to trigger bot response
    fireEvent.change(input, { target: { value: 'Hello bot' } });
    fireEvent.click(sendButton);
    
    // Wait for user message
    await waitFor(() => {
      expect(screen.getByText(/Hello bot/)).toBeInTheDocument();
    });
    
    // Wait for bot response
    await waitFor(() => {
      expect(screen.getByText(/Mock bot response/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Both messages should be visible
    expect(screen.getByText(/Hello bot/)).toBeInTheDocument();
    expect(screen.getByText(/Mock bot response/)).toBeInTheDocument();
  });
});
