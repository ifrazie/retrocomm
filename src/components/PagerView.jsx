import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Pager interface view component
 * Displays messages in a retro pager device aesthetic
 */
const PagerView = React.memo(({
  messages,
  recentPagerMessages,
  messageNumberingInfo,
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
  onScrollToTop,
  onModeChangeToFax,
  onScrollToBottom,
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
    <div className="pager-device">
      <div className="pager-label">
        ━━━ RETROPAGER 9000 ━━━ MADE IN JAPAN ━━━
      </div>
      
      <div className="pager-screen">
        <div className="pager-display">
          {messages.length === 0 ? (
            <div>NO MESSAGES</div>
          ) : (
            recentPagerMessages.map((msg, idx) => (
              <div key={msg.id} className="pager-message">
                <div>
                  {msg.type === 'bot' && <span className="bot-prefix">[BOT] </span>}
                  MSG #{messageNumberingInfo.startIndex + idx + 1} FROM: {msg.sender}
                  {msg.type === 'sent' && msg.recipient && ` TO: ${msg.recipient}`}
                </div>
                <div>TIME: {msg.timestamp}</div>
                <div>TEXT: {msg.content}</div>
                {msg.status && (
                  <div className="message-status">
                    [{msg.status.toUpperCase()}]
                  </div>
                )}
                <div>━━━━━━━━━━━━━━━━━━━━━</div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="typing-indicator">
              <span className="bot-prefix">[LLM] </span>{llmGenerating ? 'GENERATING' : 'TYPING'}
              <span className="typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pager-controls">
        <button className="pager-btn" onClick={onScrollToTop} aria-label="Scroll to top">▲ UP</button>
        <button className="pager-btn" onClick={onModeChangeToFax} aria-label="Switch to fax mode">📠 FAX</button>
        <button className="pager-btn" onClick={onScrollToBottom} aria-label="Scroll to bottom">▼ DOWN</button>
        <button className="pager-btn" onClick={onClearMessages} aria-label="Clear all messages">✕ CLEAR</button>
        <button className="pager-btn" onClick={onOpenSettings} aria-label="Open settings menu">⚙ MENU</button>
        <button className="pager-btn" onClick={onOpenUserSelector} aria-label="Select recipient">👤 TO</button>
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
            SEND
          </button>
        </div>
        <div className="webhook-status">
          <span className={`alert-led ${hasNewMessage ? 'active' : ''}`}></span>
          {webhookStatus === 'sending' ? (
            <>
              <div className="webhook-spinner"></div>
              <span>WEBHOOK: TRANSMITTING...</span>
            </>
          ) : (
            <>
              <div className="webhook-indicator"></div>
              <span>USER: {currentUser?.username || 'GUEST'} | LLM: {llmInitializing ? 'INIT...' : llmConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </>
          )}
        </div>
      </div>

      <div className="device-label">
        MODEL: RP-9000 | SN: 19891225 | FCC ID: RETRO2025
      </div>
    </div>
  );
});

PagerView.displayName = 'PagerView';

PagerView.propTypes = {
  messages: PropTypes.array.isRequired,
  recentPagerMessages: PropTypes.array.isRequired,
  messageNumberingInfo: PropTypes.shape({
    startIndex: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }).isRequired,
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
  onScrollToTop: PropTypes.func.isRequired,
  onModeChangeToFax: PropTypes.func.isRequired,
  onScrollToBottom: PropTypes.func.isRequired,
  onClearMessages: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onOpenUserSelector: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onSendMessage: PropTypes.func.isRequired
};

export default PagerView;
