import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WebhookConfig from './WebhookConfig.jsx';
import { ConfigProvider } from '../contexts/ConfigContext.jsx';

const renderWithProvider = (component) => {
  return render(
    <ConfigProvider>
      {component}
    </ConfigProvider>
  );
};

describe('WebhookConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render webhook configuration form', () => {
    renderWithProvider(<WebhookConfig />);
    
    expect(screen.getByText('Webhook Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Incoming Webhook URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Outgoing Webhook URL/)).toBeInTheDocument();
  });

  it('should display backend webhook endpoint', () => {
    renderWithProvider(<WebhookConfig />);
    
    const endpointInput = screen.getByDisplayValue(/\/api\/webhook/);
    expect(endpointInput).toBeInTheDocument();
    expect(endpointInput).toHaveAttribute('readOnly');
  });

  it('should validate URL format on blur', async () => {
    renderWithProvider(<WebhookConfig />);
    
    const outgoingInput = screen.getByLabelText(/Outgoing Webhook URL/);
    
    // Enter invalid URL
    fireEvent.change(outgoingInput, { target: { value: 'not-a-url' } });
    fireEvent.blur(outgoingInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid URL format/)).toBeInTheDocument();
    });
  });

  it('should accept valid HTTP URLs', async () => {
    renderWithProvider(<WebhookConfig />);
    
    const outgoingInput = screen.getByLabelText(/Outgoing Webhook URL/);
    
    // Enter valid URL
    fireEvent.change(outgoingInput, { target: { value: 'https://example.com/webhook' } });
    fireEvent.blur(outgoingInput);
    
    // Should not show error
    await waitFor(() => {
      expect(screen.queryByText(/Invalid URL format/)).not.toBeInTheDocument();
    });
  });

  it('should show auth token field when auth is enabled', () => {
    renderWithProvider(<WebhookConfig />);
    
    const authCheckbox = screen.getByLabelText(/Enable Authentication/);
    fireEvent.click(authCheckbox);
    
    expect(screen.getByLabelText(/Authentication Token/)).toBeInTheDocument();
  });

  it('should require auth token when auth is enabled', async () => {
    renderWithProvider(<WebhookConfig />);
    
    // Enable auth
    const authCheckbox = screen.getByLabelText(/Enable Authentication/);
    fireEvent.click(authCheckbox);
    
    // Try to submit without token
    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Auth token is required/)).toBeInTheDocument();
    });
  });

  it('should have copy button for webhook endpoint', () => {
    renderWithProvider(<WebhookConfig />);
    
    const copyButton = screen.getByText('Copy');
    expect(copyButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithProvider(<WebhookConfig onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});
