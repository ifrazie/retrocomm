import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Toast from './Toast.jsx';

describe('Toast Component', () => {
  let onCloseMock;

  beforeEach(() => {
    onCloseMock = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with correct message and type', () => {
    render(<Toast message="Test message" type="success" onClose={onCloseMock} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    const toastElement = screen.getByText('Test message').closest('.toast');
    expect(toastElement).toHaveClass('toast-success');
  });

  it('should render error type with correct styling', () => {
    render(<Toast message="Error message" type="error" onClose={onCloseMock} />);
    
    const toastElement = screen.getByText('Error message').closest('.toast');
    expect(toastElement).toHaveClass('toast-error');
  });

  it('should render warning type with correct styling', () => {
    render(<Toast message="Warning message" type="warning" onClose={onCloseMock} />);
    
    const toastElement = screen.getByText('Warning message').closest('.toast');
    expect(toastElement).toHaveClass('toast-warning');
  });

  it('should render info type with correct styling', () => {
    render(<Toast message="Info message" type="info" onClose={onCloseMock} />);
    
    const toastElement = screen.getByText('Info message').closest('.toast');
    expect(toastElement).toHaveClass('toast-info');
  });

  it('should default to info type when no type is provided', () => {
    render(<Toast message="Default message" onClose={onCloseMock} />);
    
    const toastElement = screen.getByText('Default message').closest('.toast');
    expect(toastElement).toHaveClass('toast-info');
  });

  it('should auto-dismiss after specified duration', () => {
    render(<Toast message="Test message" type="success" duration={3000} onClose={onCloseMock} />);
    
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Fast-forward time by 3000ms
    vi.advanceTimersByTime(3000);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after default duration (3000ms)', () => {
    render(<Toast message="Test message" type="success" onClose={onCloseMock} />);
    
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Fast-forward time by 3000ms (default duration)
    vi.advanceTimersByTime(3000);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after custom duration', () => {
    render(<Toast message="Test message" type="success" duration={5000} onClose={onCloseMock} />);
    
    // Should not dismiss before duration
    vi.advanceTimersByTime(4999);
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Should dismiss after duration
    vi.advanceTimersByTime(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should call onClose callback when timer completes', () => {
    render(<Toast message="Test message" type="success" duration={1000} onClose={onCloseMock} />);
    
    vi.advanceTimersByTime(1000);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should display correct icon for success type', () => {
    render(<Toast message="Success" type="success" onClose={onCloseMock} />);
    
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display correct icon for error type', () => {
    render(<Toast message="Error" type="error" onClose={onCloseMock} />);
    
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should display correct icon for warning type', () => {
    render(<Toast message="Warning" type="warning" onClose={onCloseMock} />);
    
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('should display correct icon for info type', () => {
    render(<Toast message="Info" type="info" onClose={onCloseMock} />);
    
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('should clean up timer on unmount', () => {
    const { unmount } = render(<Toast message="Test" type="success" duration={3000} onClose={onCloseMock} />);
    
    // Unmount before timer completes
    unmount();
    
    // Advance time after unmount
    vi.advanceTimersByTime(3000);
    
    // onClose should not be called after unmount
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
