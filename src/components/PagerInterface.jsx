import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../contexts/MessageContext.jsx';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { playBeep } from '../utils/beep.js';
import { retryFetch } from '../utils/retry.js';
import Toast from './Toast.jsx';
import './PagerInterface.css';

/**
 * MessageItem Component
 * Memoized individual message display for better performance
 */
const MessageItem = React.memo(({ message }) => {
  // Truncate message content to 240 characters
  const truncatedContent = message.content.length > 240
    ? message.content.substring(0, 240) + '...'
    : message.content;

  return (
    <div className="PagerInterface__message">
      <span className="PagerInterface__timestamp">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
      <span className="PagerInterface__content">
        {truncatedContent}
      </span>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

/**
 * PagerInterface Component
 * Displays messages in a retro pager-style interface with green-on-black styling
 */
const PagerInterface = () => {
  const { messages } = useMessages();
  const { preferences, toggleSound, webhooks } = useConfig();
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const previousMessageCount = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Play beep sound when new messages arrive
  useEffect(() => {
    if (messages.length > previousMessageCount.current && preferences.soundEnabled) {
      playBeep();
    }
    previousMessageCount.current = messages.length;
    scrollToBottom();
  }, [messages, preferences.soundEnabled]);

  const _handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const _sendMessage = async (messageContent) => {
    const payload = {
      message: messageContent,
      timestamp: Date.now(),
      sender: 'pager-user'
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhooks.enableAuth && webhooks.authToken && {
          'Authorization': `Bearer ${webhooks.authToken}`
        })
      },
      body: JSON.stringify(payload)
    };

    // Use retry logic with exponential backoff
    await retryFetch(
      webhooks.outgoingUrl,
      fetchOptions,
      {
        maxAttempts: 3,
        baseDelay: 1000,
        onRetry: (attempt, delay, error) => {
          console.log(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
        }
      }
    );
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) {
      return;
    }
    
    // Check if outgoing webhook is configured
    if (!webhooks.outgoingUrl) {
      console.error('Outgoing webhook URL not configured');
      setToast({
        message: 'Please configure outgoing webhook URL in settings',
        type: 'warning'
      });
      return;
    }

    const messageToSend = inputValue;
    setPendingMessage(messageToSend);
    setIsSending(true);

    try {
      await _sendMessage(messageToSend);

      // Clear input after successful send
      setInputValue('');
      setPendingMessage(null);
      setIsSending(false);
      
      // Show success toast briefly
      setToast({
        message: 'Message sent successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      
      // Show error toast with retry button
      setToast({
        message: `Failed to send message: ${error.message}`,
        type: 'error',
        onRetry: () => _handleRetry()
      });
    }
  };

  const _handleRetry = async () => {
    if (!pendingMessage || isSending) return;

    // Close current toast
    setToast(null);
    setIsSending(true);

    try {
      await _sendMessage(pendingMessage);

      // Clear input and pending message after successful retry
      setInputValue('');
      setPendingMessage(null);
      setIsSending(false);
      
      // Show success toast
      setToast({
        message: 'Message sent successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Retry failed:', error);
      setIsSending(false);
      
      // Show error toast again with retry button
      setToast({
        message: `Failed to send message: ${error.message}`,
        type: 'error',
        onRetry: () => _handleRetry()
      });
    }
  };

  const _handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div className="PagerInterface">
      <div className="PagerInterface__header">
        <div className="PagerInterface__title">PAGER</div>
        <button
          className="PagerInterface__sound-toggle"
          onClick={toggleSound}
          title={preferences.soundEnabled ? 'Sound ON' : 'Sound OFF'}
        >
          {preferences.soundEnabled ? '🔊' : '🔇'}
        </button>
        <div className="PagerInterface__status">READY</div>
      </div>

      <div className="PagerInterface__display">
        <div className="PagerInterface__messages">
          {messages.slice(-50).map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="PagerInterface__input-form" onSubmit={_handleSubmit}>
        <input
          type="text"
          className="PagerInterface__input"
          value={inputValue}
          onChange={_handleInputChange}
          placeholder="Type message..."
          maxLength={240}
          disabled={isSending}
        />
        <button 
          type="submit" 
          className={`PagerInterface__send-btn ${isSending ? 'PagerInterface__send-btn--loading' : ''}`}
          disabled={isSending}
        >
          {isSending ? (
            <>
              <span className="PagerInterface__spinner" />
              SENDING...
            </>
          ) : (
            'SEND'
          )}
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onRetry={toast.onRetry}
          onClose={_handleCloseToast}
        />
      )}
    </div>
  );
};

export default PagerInterface;
