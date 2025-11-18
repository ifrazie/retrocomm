import React from 'react';
import PropTypes from 'prop-types';

/**
 * Settings Modal Component
 * Extracted from App.jsx for better code organization and performance
 */
const SettingsModal = ({
    showSettings,
    onClose,
    currentUser,
    llmConnected,
    llmInitializing,
    webhookConfig,
    setWebhookConfig,
    onLogout,
    onSaveWebhookConfig,
    onCopyWebhookUrl
}) => {
    if (!showSettings) return null;

    return (
        <div 
            className="settings-modal-overlay" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
        >
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2 id="settings-modal-title">⚙ WEBHOOK CONFIGURATION</h2>
                    <button 
                        className="settings-close" 
                        onClick={onClose}
                        aria-label="Close settings"
                    >
                        ×
                    </button>
                </div>

                <form className="settings-form" onSubmit={onSaveWebhookConfig}>
                    <div className="settings-section">
                        <h3>👤 User Status</h3>
                        <div className="llm-status-display">
                            <div className="llm-status-indicator connected">
                                ✓ Logged in as: {currentUser?.username || 'Guest'}
                            </div>
                            <button
                                type="button"
                                className="settings-save-btn"
                                onClick={onLogout}
                                style={{ marginTop: '10px' }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>🤖 LLM Status</h3>
                        <div className="llm-status-display">
                            <div className={`llm-status-indicator ${llmConnected ? 'connected' : 'disconnected'}`}>
                                {llmInitializing ? '⏳ Initializing...' : llmConnected ? '✓ Connected to LM Studio' : '✗ LM Studio Offline'}
                            </div>
                            {!llmConnected && !llmInitializing && (
                                <p className="settings-description" style={{color: '#ff6b6b'}}>
                                    Start LM Studio and load a model to enable AI responses.
                                    <br />
                                    <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer" style={{color: '#00ff41'}}>
                                        Download LM Studio →
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Your Webhook Endpoint</h3>
                        <p className="settings-description">
                            Use this URL to receive messages from external services
                        </p>
                        <div className="settings-endpoint">
                            <input
                                type="text"
                                className="settings-input"
                                value={`${window.location.origin}/api/webhook`}
                                readOnly
                            />
                            <button
                                type="button"
                                className="settings-copy-btn"
                                onClick={onCopyWebhookUrl}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="settings-section">
                        <label className="settings-label">
                            Outgoing Webhook URL
                        </label>
                        <input
                            type="text"
                            className="settings-input"
                            value={webhookConfig.outgoingUrl}
                            onChange={(e) => setWebhookConfig({...webhookConfig, outgoingUrl: e.target.value})}
                            placeholder="https://example.com/receive"
                        />
                        <p className="settings-description">
                            URL where your messages will be sent
                        </p>
                    </div>

                    <div className="settings-section">
                        <h3>Authentication</h3>
                        <label className="settings-checkbox">
                            <input
                                type="checkbox"
                                checked={webhookConfig.enableAuth}
                                onChange={(e) => setWebhookConfig({...webhookConfig, enableAuth: e.target.checked})}
                            />
                            <span>Enable Authentication</span>
                        </label>

                        {webhookConfig.enableAuth && (
                            <div className="settings-auth-token">
                                <label className="settings-label">
                                    Authentication Token
                                </label>
                                <input
                                    type="password"
                                    className="settings-input"
                                    value={webhookConfig.authToken}
                                    onChange={(e) => setWebhookConfig({...webhookConfig, authToken: e.target.value})}
                                    placeholder="Enter your auth token"
                                />
                                <p className="settings-description">
                                    Bearer token for webhook authentication
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="settings-actions">
                        <button type="submit" className="settings-save-btn">
                            Save Configuration
                        </button>
                        <button
                            type="button"
                            className="settings-cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

SettingsModal.propTypes = {
    showSettings: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentUser: PropTypes.shape({
        userId: PropTypes.string,
        username: PropTypes.string,
        sessionId: PropTypes.string
    }),
    llmConnected: PropTypes.bool.isRequired,
    llmInitializing: PropTypes.bool.isRequired,
    webhookConfig: PropTypes.shape({
        outgoingUrl: PropTypes.string,
        enableAuth: PropTypes.bool,
        authToken: PropTypes.string
    }).isRequired,
    setWebhookConfig: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    onSaveWebhookConfig: PropTypes.func.isRequired,
    onCopyWebhookUrl: PropTypes.func.isRequired
};

export default React.memo(SettingsModal);
