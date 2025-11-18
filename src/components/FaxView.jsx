import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Fax interface view component
 * Displays messages in a retro fax machine aesthetic
 */
const FaxView = React.memo(({
  messages,
  isTyping,
  llmGenerating,
  hasNewMessage,
  webhookStatus,
  currentUser,
  llmInitializing,
  llmConnected,
  inputMessage,
  selectedRecipient,
  messagesEndRef,
  onModeChangeToPager,
  onClearMessages,
  onOpenSettings,
  onOpenUserSelector,
  onInputChange,
  onKeyPress,
  onSendMessage
}) => {
  const recipientDisplayStyle = useMemo(() => ({
    padding: '8px 15px',
    background: '#0a0a0a',
    border: '2px solid #00ff41',
    marginBottom: '10px',
    fontFamily: "'Courier New', monospace",
    color: '#00ff41',
    fontSize: '0.9rem',
    letterSpacing: '1px'
  }), []);

  return (
    <div className="fax-device">
      <div className="fax-header">
        <span className={`alert-led ${hasNewMessage ? 'active' : ''}`}></span>
        FACSIMILE TRANSCEIVER | AWS KIRO WEBHOOK ENABLED
      </div>

      <div className="fax-paper-slot">
        <div className="fax-paper">
          {webhookStatus === 'sending' && <div className="scanning-line"></div>}
          
          {messages.length === 0 ? (
            <div className="fax-empty-state">
              NO FAX RECEIVED
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className="fax-message">
                <div className="fax-header-line">
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                </div>
                <div className="fax-header-line">
                  FROM: {msg.sender.toUpperCase()}
                  {msg.type === 'sent' && msg.recipient && (
                    <>
                      <br />
                      TO: {msg.recipient.toUpperCase()}
                    </>
                  )}
                  <br />
                  DATE: {new Date().toLocaleDateString()} {msg.timestamp}
                  <br />
                  PAGE: {idx + 1} OF {messages.length}
                  {msg.type === 'bot' && ' | TYPE: AUTOMATED'}
                </div>
                <div className="fax-header-line">
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                </div>
                <div className="fax-message-content">
                  {msg.content}
                </div>
                {msg.status && (
                  <div className="fax-status">
                    STATUS: {msg.status.toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="fax-message" style={{color: '#666'}}>
              <div className="fax-header-line">
                {llmGenerating ? 'LLM GENERATING RESPONSE...' : 'INCOMING TRANSMISSION...'}
              </div>
              <div className="typing-dots">
                PRINTING<span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area">
        <div className="recipient-display" style={recipientDisplayStyle}>
          TO: {selectedRecipient || 'SELECT RECIPIENT'} {selectedRecipient === 'ChatBot' && '🤖'}
        </div>
        <div className="input-container">
          <input
            type="text"
            className="message-input"
            placeholder={`Message to ${selectedRecipient || 'recipient'}...`}
            value={inputMessage}
            onChange={onInputChange}
            onKeyPress={onKeyPress}
          />
          <button className="send-btn" onClick={onSendMessage}>
            TRANSMIT
          </button>
        </div>
        <div className="webhook-status">
          {webhookStatus === 'sending' ? (
            <>
              <div className="webhook-spinner"></div>
              <span>TRANSMITTING VIA WEBHOOK...</span>
            </>
          ) : (
            <>
              <div className="webhook-indicator"></div>
              <span>USER: {currentUser?.username || 'GUEST'} | LLM: {llmInitializing ? 'INIT...' : llmConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </>
          )}
        </div>
      </div>

      <div className="pager-controls">
        <button className="pager-btn" onClick={onModeChangeToPager} aria-label="Switch to pager mode">📟 PAGER</button>
        <button className="pager-btn" onClick={onClearMessages} aria-label="Clear all messages">🗑 CLEAR</button>
        <button className="pager-btn" onClick={onOpenSettings} aria-label="Open settings menu">⚙ MENU</button>
        <button className="pager-btn" onClick={onOpenUserSelector} aria-label="Select recipient">👤 TO</button>
      </div>

      <div className="device-label">
        FAX-2000 | THERMAL PRINTER | 9600 BAUD MODEM
      </div>
    </div>
  );
});

FaxView.displayName = 'FaxView';

FaxView.propTypes = {
  messages: PropTypes.array.isRequired,
  isTyping: PropTypes.bool.isRequired,
  llmGenerating: PropTypes.bool.isRequired,
  hasNewMessage: PropTypes.bool.isRequired,
  webhookStatus: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string
  }),
  llmInitializing: PropTypes.bool.isRequired,
  llmConnected: PropTypes.bool.isRequired,
  inputMessage: PropTypes.string.isRequired,
  selectedRecipient: PropTypes.string,
  messagesEndRef: PropTypes.object.isRequired,
  onModeChangeToPager: PropTypes.func.isRequired,
  onClearMessages: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onOpenUserSelector: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired
};

export default FaxView;
