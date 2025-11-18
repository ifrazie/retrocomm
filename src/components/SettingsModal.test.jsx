import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from './SettingsModal';

describe('SettingsModal', () => {
  const defaultProps = {
    showSettings: true,
    onClose: vi.fn(),
    currentUser: { username: 'testuser', userId: '123', sessionId: 'abc' },
    llmConnected: true,
    llmInitializing: false,
    webhookConfig: {
      outgoingUrl: 'https://example.com/webhook',
      enableAuth: false,
      authToken: ''
    },
    setWebhookConfig: vi.fn(),
    onLogout: vi.fn(),
    onSaveWebhookConfig: vi.fn(),
    onCopyWebhookUrl: vi.fn()
  };

  it('renders nothing when showSettings is false', () => {
    const { container } = render(
      <SettingsModal {...defaultProps} showSettings={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal when showSettings is true', () => {
    render(<SettingsModal {...defaultProps} />);

    expect(screen.getByText(/WEBHOOK CONFIGURATION/i)).toBeInTheDocument();
  });

  it('displays current username', () => {
    render(<SettingsModal {...defaultProps} />);

    expect(screen.getByText(/Logged in as: testuser/i)).toBeInTheDocument();
  });

  it('shows LLM connected status', () => {
    render(<SettingsModal {...defaultProps} />);

    expect(screen.getByText(/Connected to LM Studio/i)).toBeInTheDocument();
  });

  it('shows LLM offline status when not connected', () => {
    render(<SettingsModal {...defaultProps} llmConnected={false} />);

    expect(screen.getByText(/LM Studio Offline/i)).toBeInTheDocument();
  });

  it('shows initializing status', () => {
    render(<SettingsModal {...defaultProps} llmInitializing={true} llmConnected={false} />);

    expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
  });

  it('displays webhook endpoint URL', () => {
    render(<SettingsModal {...defaultProps} />);

    const input = screen.getByDisplayValue(/\/api\/webhook/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
  });

  it('displays outgoing webhook URL', () => {
    render(<SettingsModal {...defaultProps} />);

    const input = screen.getByDisplayValue('https://example.com/webhook');
    expect(input).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close settings');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);

    const modalContent = screen.getByText(/WEBHOOK CONFIGURATION/i).closest('.settings-modal');
    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = vi.fn();
    render(<SettingsModal {...defaultProps} onLogout={onLogout} />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyWebhookUrl when copy button is clicked', () => {
    const onCopyWebhookUrl = vi.fn();
    render(<SettingsModal {...defaultProps} onCopyWebhookUrl={onCopyWebhookUrl} />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    expect(onCopyWebhookUrl).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveWebhookConfig when form is submitted', () => {
    const onSaveWebhookConfig = vi.fn((e) => e.preventDefault());
    render(<SettingsModal {...defaultProps} onSaveWebhookConfig={onSaveWebhookConfig} />);

    const saveButton = screen.getByText('Save Configuration');
    fireEvent.click(saveButton);

    expect(onSaveWebhookConfig).toHaveBeenCalledTimes(1);
  });

  it('updates webhook config when outgoing URL changes', () => {
    const setWebhookConfig = vi.fn();
    render(<SettingsModal {...defaultProps} setWebhookConfig={setWebhookConfig} />);

    const input = screen.getByPlaceholderText('https://example.com/receive');
    fireEvent.change(input, { target: { value: 'https://new-url.com' } });

    expect(setWebhookConfig).toHaveBeenCalled();
  });

  it('shows auth token field when authentication is enabled', () => {
    const webhookConfig = {
      ...defaultProps.webhookConfig,
      enableAuth: true
    };

    render(<SettingsModal {...defaultProps} webhookConfig={webhookConfig} />);

    expect(screen.getByPlaceholderText('Enter your auth token')).toBeInTheDocument();
  });

  it('hides auth token field when authentication is disabled', () => {
    render(<SettingsModal {...defaultProps} />);

    expect(screen.queryByPlaceholderText('Enter your auth token')).not.toBeInTheDocument();
  });

  it('has cancel button that calls onClose', () => {
    const onClose = vi.fn();
    render(<SettingsModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
