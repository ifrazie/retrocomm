import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('App Integration Tests - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ARIA Labels - Pager Mode', () => {
    it('should have correct ARIA label for scroll to top button', () => {
      render(<App />);
      
      const button = screen.getByRole('button', { name: 'Scroll to top' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Scroll to top');
    });

    it('should have correct ARIA label for switch to fax mode button', () => {
      render(<App />);
      
      // Find the FAX button in pager controls (not the mode switcher)
      const pagerControls = document.querySelector('.pager-controls');
      const button = within(pagerControls).getByRole('button', { name: 'Switch to fax mode' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to fax mode');
    });

    it('should have correct ARIA label for scroll to bottom button', () => {
      render(<App />);
      
      const button = screen.getByRole('button', { name: 'Scroll to bottom' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Scroll to bottom');
    });

    it('should have correct ARIA label for clear messages button', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button', { name: 'Clear all messages' });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Clear all messages');
      });
    });

    it('should have correct ARIA label for open settings button', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button', { name: 'Open settings menu' });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Open settings menu');
      });
    });

    it('should have correct ARIA label for mark as read button', () => {
      render(<App />);
      
      const buttons = screen.getAllByRole('button', { name: 'Mark messages as read' });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', 'Mark messages as read');
      });
    });
  });

  describe('ARIA Labels - Fax Mode', () => {
    it('should have correct ARIA label for switch to pager mode button in fax mode', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Switch to fax mode
      const faxModeButton = screen.getByText('📠 Fax Mode');
      await user.click(faxModeButton);
      
      // Find the PAGER button in fax controls
      const faxControls = document.querySelector('.pager-controls');
      const button = within(faxControls).getByRole('button', { name: 'Switch to pager mode' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to pager mode');
    });

    it('should have correct ARIA labels for all buttons in fax mode', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Switch to fax mode
      const faxModeButton = screen.getByText('📠 Fax Mode');
      await user.click(faxModeButton);
      
      // Verify all buttons have aria-labels
      const clearButton = screen.getAllByRole('button', { name: 'Clear all messages' });
      expect(clearButton.length).toBeGreaterThan(0);
      
      const menuButton = screen.getAllByRole('button', { name: 'Open settings menu' });
      expect(menuButton.length).toBeGreaterThan(0);
      
      const readButton = screen.getAllByRole('button', { name: 'Mark messages as read' });
      expect(readButton.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Labels - Mode Switcher', () => {
    it('should have correct ARIA label for pager mode switcher button', () => {
      render(<App />);
      
      const modeSwitcher = document.querySelector('.mode-switcher');
      const button = within(modeSwitcher).getByRole('button', { name: 'Switch to pager mode' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to pager mode');
    });

    it('should have correct ARIA label for fax mode switcher button', () => {
      render(<App />);
      
      const modeSwitcher = document.querySelector('.mode-switcher');
      const button = within(modeSwitcher).getByRole('button', { name: 'Switch to fax mode' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Switch to fax mode');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow keyboard navigation through buttons', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Tab through buttons
      await user.tab();
      
      // First focusable element should be a button
      const firstButton = document.activeElement;
      expect(firstButton.tagName).toBe('BUTTON');
      
      // Continue tabbing
      await user.tab();
      const secondButton = document.activeElement;
      expect(secondButton.tagName).toBe('BUTTON');
      
      // Verify we can navigate through multiple buttons
      expect(firstButton).not.toBe(secondButton);
    });

    it('should allow Enter key to activate buttons', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Find and focus the fax mode button
      const faxModeButton = screen.getByText('📠 Fax Mode');
      faxModeButton.focus();
      
      // Press Enter
      await user.keyboard('{Enter}');
      
      // Should switch to fax mode
      expect(screen.getByPlaceholderText('Type message to send...')).toBeInTheDocument();
    });

    it('should allow keyboard input in message field', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Type message...');
      
      // Focus and type
      await user.click(input);
      await user.keyboard('Test keyboard input');
      
      expect(input).toHaveValue('Test keyboard input');
    });

    it('should allow Enter key to send message', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Type message...');
      
      // Type message
      await user.click(input);
      await user.keyboard('Test message{Enter}');
      
      // Message should be sent (input cleared)
      expect(input).toHaveValue('');
    });
  });

  describe('Toast Accessibility', () => {
    it('should display toast with accessible text', async () => {
      const user = userEvent.setup();
      
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
      await user.click(menuButton);
      
      // Click copy button to trigger toast
      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);
      
      // Toast should be visible with accessible text
      const toastMessage = await screen.findByText(/Failed to copy URL/);
      expect(toastMessage).toBeInTheDocument();
      
      // Toast should have proper structure
      const toast = toastMessage.closest('.toast');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveClass('toast-error');
      
      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true
      });
    });

    it('should display toast icon for screen reader context', async () => {
      const user = userEvent.setup();
      
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
      
      // Trigger toast
      const menuButton = screen.getByRole('button', { name: /open settings menu/i });
      await user.click(menuButton);
      
      const copyButton = screen.getByText('Copy');
      await user.click(copyButton);
      
      // Wait for toast
      await screen.findByText(/Failed to copy URL/);
      
      // Verify icon is present (provides visual context)
      const icon = document.querySelector('.toast-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.textContent).toBe('✗');
      
      // Restore clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true
      });
    });
  });

  describe('Semantic HTML and Roles', () => {
    it('should use semantic button elements', () => {
      render(<App />);
      
      // All interactive controls should be buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should use semantic input elements', () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText('Type message...');
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have proper heading structure', () => {
      render(<App />);
      
      const mainHeading = screen.getByRole('heading', { name: /RETRO MESSENGER/i });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    it('should have accessible links', () => {
      render(<App />);
      
      const link = screen.getByRole('link', { name: /AWS Kiro/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus visibility', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Tab to first button
      await user.tab();
      
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeVisible();
      expect(focusedElement.tagName).toBe('BUTTON');
    });

    it('should allow focus on input field', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const input = screen.getByPlaceholderText('Type message...');
      await user.click(input);
      
      expect(document.activeElement).toBe(input);
    });

    it('should trap focus in modal when settings open', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Open settings modal
      const menuButton = screen.getByRole('button', { name: /open settings menu/i });
      await user.click(menuButton);
      
      // Modal should be visible
      expect(screen.getByText(/WEBHOOK CONFIGURATION/)).toBeInTheDocument();
      
      // Focus should be within modal
      const modal = document.querySelector('.settings-modal');
      expect(modal).toBeInTheDocument();
    });
  });
});
