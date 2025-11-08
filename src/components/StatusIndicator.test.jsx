import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusIndicator from './StatusIndicator.jsx';

describe('StatusIndicator', () => {
  it('should display connected status', () => {
    const status = {
      connected: true,
      lastUpdate: Date.now()
    };
    
    render(<StatusIndicator status={status} />);
    
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Ready to send and receive messages')).toBeInTheDocument();
  });

  it('should display disconnected status', () => {
    const status = {
      connected: false,
      lastUpdate: Date.now()
    };
    
    render(<StatusIndicator status={status} />);
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('Webhooks not configured')).toBeInTheDocument();
  });

  it('should display error status', () => {
    const status = {
      connected: false,
      error: 'Connection failed',
      lastUpdate: Date.now()
    };
    
    render(<StatusIndicator status={status} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should show configure button when disconnected', () => {
    const status = {
      connected: false,
      lastUpdate: Date.now()
    };
    const onConfigureClick = vi.fn();
    
    render(<StatusIndicator status={status} onConfigureClick={onConfigureClick} />);
    
    const configureButton = screen.getByText('Configure Webhooks');
    expect(configureButton).toBeInTheDocument();
    
    fireEvent.click(configureButton);
    expect(onConfigureClick).toHaveBeenCalled();
  });

  it('should not show configure button when connected', () => {
    const status = {
      connected: true,
      lastUpdate: Date.now()
    };
    const onConfigureClick = vi.fn();
    
    render(<StatusIndicator status={status} onConfigureClick={onConfigureClick} />);
    
    expect(screen.queryByText('Configure Webhooks')).not.toBeInTheDocument();
  });

  it('should apply correct CSS class for status type', () => {
    const { container, rerender } = render(
      <StatusIndicator status={{ connected: true, lastUpdate: Date.now() }} />
    );
    
    expect(container.querySelector('.StatusIndicator__indicator--connected')).toBeInTheDocument();
    
    rerender(<StatusIndicator status={{ connected: false, lastUpdate: Date.now() }} />);
    expect(container.querySelector('.StatusIndicator__indicator--disconnected')).toBeInTheDocument();
    
    rerender(<StatusIndicator status={{ connected: false, error: 'Error', lastUpdate: Date.now() }} />);
    expect(container.querySelector('.StatusIndicator__indicator--error')).toBeInTheDocument();
  });
});
