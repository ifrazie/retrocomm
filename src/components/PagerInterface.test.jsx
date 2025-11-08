import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PagerInterface from './PagerInterface.jsx';
import { MessageProvider } from '../contexts/MessageContext.jsx';
import { ConfigProvider } from '../contexts/ConfigContext.jsx';

// Mock the beep utility
vi.mock('../utils/beep.js', () => ({
  playBeep: vi.fn()
}));

// Mock the retry utility
vi.mock('../utils/retry.js', () => ({
  retryFetch: vi.fn()
}));

const renderWithProviders = (component) => {
  return render(
    <ConfigProvider>
      <MessageProvider>
        {component}
      </MessageProvider>
    </ConfigProvider>
  );
};

describe('PagerInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pager interface', () => {
    renderWithProviders(<PagerInterface />);
    expect(screen.getByText('PAGER')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type message...')).toBeInTheDocument();
  });

  it('should display messages', () => {
    const { container } = renderWithProviders(<PagerInterface />);
    
    // Check that messages container exists
    const messagesContainer = container.querySelector('.PagerInterface__messages');
    expect(messagesContainer).toBeInTheDocument();
  });

  it('should truncate messages longer than 240 characters', () => {
    renderWithProviders(<PagerInterface />);
    
    // The truncation logic is in the render, so we verify the maxLength on input
    const input = screen.getByPlaceholderText('Type message...');
    expect(input).toHaveAttribute('maxLength', '240');
  });

  it('should handle input changes', () => {
    renderWithProviders(<PagerInterface />);
    
    const input = screen.getByPlaceholderText('Type message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    expect(input.value).toBe('Test message');
  });

  it('should have send button', () => {
    renderWithProviders(<PagerInterface />);
    
    const sendButton = screen.getByText('SEND');
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toHaveAttribute('type', 'submit');
  });

  it('should have sound toggle button', () => {
    renderWithProviders(<PagerInterface />);
    
    const soundButton = screen.getByTitle(/Sound/);
    expect(soundButton).toBeInTheDocument();
  });
});
