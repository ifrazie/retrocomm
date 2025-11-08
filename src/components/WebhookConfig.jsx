import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { validateWebhookUrl } from '../utils/validation.js';
import './WebhookConfig.css';

/**
 * WebhookConfig Component
 * Provides configuration interface for webhook URLs and authentication settings
 */
const WebhookConfig = ({ onClose }) => {
  const { webhooks, setWebhooks } = useConfig();
  
  // Form state
  const [formData, setFormData] = useState({
    incomingUrl: '',
    outgoingUrl: '',
    authToken: '',
    enableAuth: false
  });

  // Validation errors
  const [errors, setErrors] = useState({
    incomingUrl: '',
    outgoingUrl: '',
    authToken: ''
  });

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Backend webhook endpoint URL
  const backendWebhookUrl = `${window.location.origin}/api/webhook`;

  // Load current configuration on mount
  useEffect(() => {
    setFormData({
      incomingUrl: webhooks.incomingUrl || '',
      outgoingUrl: webhooks.outgoingUrl || '',
      authToken: webhooks.authToken || '',
      enableAuth: webhooks.enableAuth || false
    });
  }, [webhooks]);

  /**
   * Handle input field changes
   */
  const _handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate URL field on blur
   */
  const _handleUrlBlur = (fieldName) => {
    const url = formData[fieldName];
    
    // Skip validation if field is empty
    if (!url || url.trim().length === 0) {
      return;
    }

    const validation = validateWebhookUrl(url);
    if (!validation.valid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.error
      }));
    }
  };

  /**
   * Validate entire form
   */
  const _validateForm = () => {
    const newErrors = {
      incomingUrl: '',
      outgoingUrl: '',
      authToken: ''
    };

    // Validate incoming URL if provided
    if (formData.incomingUrl && formData.incomingUrl.trim().length > 0) {
      const incomingValidation = validateWebhookUrl(formData.incomingUrl);
      if (!incomingValidation.valid) {
        newErrors.incomingUrl = incomingValidation.error;
      }
    }

    // Validate outgoing URL if provided
    if (formData.outgoingUrl && formData.outgoingUrl.trim().length > 0) {
      const outgoingValidation = validateWebhookUrl(formData.outgoingUrl);
      if (!outgoingValidation.valid) {
        newErrors.outgoingUrl = outgoingValidation.error;
      }
    }

    // Validate auth token if auth is enabled
    if (formData.enableAuth && (!formData.authToken || formData.authToken.trim().length === 0)) {
      newErrors.authToken = 'Auth token is required when authentication is enabled';
    }

    setErrors(newErrors);

    // Return true if no errors
    return !newErrors.incomingUrl && !newErrors.outgoingUrl && !newErrors.authToken;
  };

  /**
   * Handle form submission
   */
  const _handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!_validateForm()) {
      return;
    }

    // Save configuration
    setWebhooks({
      incomingUrl: formData.incomingUrl.trim(),
      outgoingUrl: formData.outgoingUrl.trim(),
      authToken: formData.authToken.trim(),
      enableAuth: formData.enableAuth
    });

    // Close modal if onClose provided
    if (onClose) {
      onClose();
    }
  };

  /**
   * Copy backend webhook URL to clipboard
   */
  const _handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(backendWebhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy URL. Please copy manually.');
    }
  };

  return (
    <div className="WebhookConfig">
      <div className="WebhookConfig__header">
        <h2 className="WebhookConfig__title">Webhook Configuration</h2>
        {onClose && (
          <button
            className="WebhookConfig__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      <form className="WebhookConfig__form" onSubmit={_handleSubmit}>
        {/* Backend Webhook Endpoint Display */}
        <div className="WebhookConfig__section">
          <h3 className="WebhookConfig__section-title">Your Webhook Endpoint</h3>
          <p className="WebhookConfig__description">
            Use this URL to receive messages from external services
          </p>
          <div className="WebhookConfig__endpoint-display">
            <input
              type="text"
              className="WebhookConfig__endpoint-input"
              value={backendWebhookUrl}
              readOnly
            />
            <button
              type="button"
              className="WebhookConfig__copy-btn"
              onClick={_handleCopyWebhookUrl}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Incoming Webhook URL */}
        <div className="WebhookConfig__field">
          <label htmlFor="incomingUrl" className="WebhookConfig__label">
            Incoming Webhook URL (Optional)
          </label>
          <input
            type="text"
            id="incomingUrl"
            name="incomingUrl"
            className={`WebhookConfig__input ${errors.incomingUrl ? 'WebhookConfig__input--error' : ''}`}
            value={formData.incomingUrl}
            onChange={_handleInputChange}
            onBlur={() => _handleUrlBlur('incomingUrl')}
            placeholder="https://example.com/webhook"
          />
          {errors.incomingUrl && (
            <span className="WebhookConfig__error">{errors.incomingUrl}</span>
          )}
          <p className="WebhookConfig__field-description">
            Alternative endpoint for receiving messages (if not using the default above)
          </p>
        </div>

        {/* Outgoing Webhook URL */}
        <div className="WebhookConfig__field">
          <label htmlFor="outgoingUrl" className="WebhookConfig__label">
            Outgoing Webhook URL
          </label>
          <input
            type="text"
            id="outgoingUrl"
            name="outgoingUrl"
            className={`WebhookConfig__input ${errors.outgoingUrl ? 'WebhookConfig__input--error' : ''}`}
            value={formData.outgoingUrl}
            onChange={_handleInputChange}
            onBlur={() => _handleUrlBlur('outgoingUrl')}
            placeholder="https://example.com/receive"
          />
          {errors.outgoingUrl && (
            <span className="WebhookConfig__error">{errors.outgoingUrl}</span>
          )}
          <p className="WebhookConfig__field-description">
            URL where your messages will be sent
          </p>
        </div>

        {/* Authentication Settings */}
        <div className="WebhookConfig__section">
          <h3 className="WebhookConfig__section-title">Authentication</h3>
          
          <div className="WebhookConfig__field">
            <label className="WebhookConfig__checkbox-label">
              <input
                type="checkbox"
                name="enableAuth"
                checked={formData.enableAuth}
                onChange={_handleInputChange}
              />
              <span>Enable Authentication</span>
            </label>
          </div>

          {formData.enableAuth && (
            <div className="WebhookConfig__field">
              <label htmlFor="authToken" className="WebhookConfig__label">
                Authentication Token
              </label>
              <input
                type="password"
                id="authToken"
                name="authToken"
                className={`WebhookConfig__input ${errors.authToken ? 'WebhookConfig__input--error' : ''}`}
                value={formData.authToken}
                onChange={_handleInputChange}
                placeholder="Enter your auth token"
              />
              {errors.authToken && (
                <span className="WebhookConfig__error">{errors.authToken}</span>
              )}
              <p className="WebhookConfig__field-description">
                Bearer token for webhook authentication
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="WebhookConfig__actions">
          <button type="submit" className="WebhookConfig__save-btn">
            Save Configuration
          </button>
          {onClose && (
            <button
              type="button"
              className="WebhookConfig__cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WebhookConfig;
