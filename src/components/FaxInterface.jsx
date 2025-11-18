import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../contexts/MessageContext.jsx';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { renderFaxWithAnimation } from '../utils/faxRenderer.js';
import { retryFetch } from '../utils/retry.js';
import { logger } from '../utils/logger.js';
import Toast from './Toast.jsx';
import './FaxInterface.css';
import {
    MAX_FAX_ARCHIVE,
    FAX_ANIMATION_DURATION_MS,
    DEFAULT_RETRY_ATTEMPTS,
    DEFAULT_RETRY_BASE_DELAY
} from '../utils/constants.js';

/**
 * FaxThumbnail Component
 * Memoized thumbnail display for better performance
 */
const FaxThumbnail = React.memo(({ fax, onClick }) => {
  return (
    <div
      className={`FaxInterface__thumbnail ${fax.isFallback ? 'FaxInterface__thumbnail--fallback' : ''}`}
      onClick={() => onClick(fax)}
    >
      {fax.isFallback ? (
        <div className="FaxInterface__thumbnail-text">
          <div className="FaxInterface__thumbnail-text-content">
            {fax.content.substring(0, 50)}...
          </div>
        </div>
      ) : (
        <img
          src={fax.imageDataUrl}
          alt={`Fax from ${fax.sender || 'Unknown'}`}
          className="FaxInterface__thumbnail-img"
        />
      )}
      <div className="FaxInterface__thumbnail-info">
        {new Date(fax.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
});

FaxThumbnail.displayName = 'FaxThumbnail';

/**
 * FaxInterface Component
 * Displays messages as vintage fax documents with transmission effects
 */
const FaxInterface = () => {
  const { messages } = useMessages();
  const { webhooks } = useConfig();
  const [inputValue, setInputValue] = useState('');
  const [faxArchive, setFaxArchive] = useState([]);
  const [selectedFax, setSelectedFax] = useState(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Track blob URLs for cleanup to prevent memory leaks
  const blobUrlsRef = useRef(new Set());
  const [pendingMessage, setPendingMessage] = useState(null);
  const [renderingError, setRenderingError] = useState(false);
  const canvasRef = useRef(null);
  const previousMessageCount = useRef(messages.length);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revoke all blob URLs when component unmounts
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  // Note: Blob URL cleanup is now handled directly in the state setter
  // to prevent memory leaks more efficiently

  // Process new messages and render as fax documents
  useEffect(() => {
    const processNewMessages = async () => {
      if (messages.length > previousMessageCount.current) {
        const newMessages = messages.slice(previousMessageCount.current);
        
        for (const message of newMessages) {
          await renderNewFax(message);
        }
        
        previousMessageCount.current = messages.length;
      }
    };

    processNewMessages();
  }, [messages]);

  /**
   * Render a new fax document with animation
   * @param {import('../types/index.js').Message} message - Message to render
   */
  const renderNewFax = async (message) => {
    if (!canvasRef.current) return;

    setIsTransmitting(true);

    try {
      // Check if Canvas API is available
      if (!canvasRef.current.getContext) {
        throw new Error('Canvas API not supported');
      }

      // Render with animation
      const dataUrl = await renderFaxWithAnimation(
        message,
        canvasRef.current,
        (progress) => {
          // Animation progress callback (optional use for UI feedback)
        },
        FAX_ANIMATION_DURATION_MS
      );

      // Track blob URLs for cleanup (data: URLs don't need cleanup)
      if (dataUrl.startsWith('blob:')) {
        blobUrlsRef.current.add(dataUrl);
      }

      // Create fax document object
      const faxDoc = {
        id: message.id,
        imageDataUrl: dataUrl,
        timestamp: message.timestamp,
        sender: message.sender,
        content: message.content
      };

      // Add to archive (limit to MAX_FAX_ARCHIVE)
      setFaxArchive(prev => {
        const updated = [...prev, faxDoc];
        const trimmed = updated.slice(-MAX_FAX_ARCHIVE);
        
        // Revoke URLs for removed items immediately
        if (updated.length > MAX_FAX_ARCHIVE) {
          const removed = updated.slice(0, updated.length - MAX_FAX_ARCHIVE);
          removed.forEach(fax => {
            if (fax.imageDataUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(fax.imageDataUrl);
              blobUrlsRef.current.delete(fax.imageDataUrl);
            }
          });
        }
        
        return trimmed;
      });

      setIsTransmitting(false);
      
      // Clear any previous rendering errors
      if (renderingError) {
        setRenderingError(false);
      }
    } catch (error) {
      logger.error('Error rendering fax:', error);
      setIsTransmitting(false);
      
      // Set rendering error state
      if (!renderingError) {
        setRenderingError(true);
        setToast({
          message: 'Canvas rendering failed. Falling back to plain text display.',
          type: 'warning'
        });
      }
      
      // Create fallback plain text document
      const fallbackDoc = {
        id: message.id,
        imageDataUrl: null, // No image, will display as text
        timestamp: message.timestamp,
        sender: message.sender,
        content: message.content,
        isFallback: true
      };

      // Add to archive (limit to MAX_FAX_ARCHIVE)
      setFaxArchive(prev => {
        const updated = [...prev, fallbackDoc];
        const trimmed = updated.slice(-MAX_FAX_ARCHIVE);
        
        // Revoke URLs for removed items immediately
        if (updated.length > MAX_FAX_ARCHIVE) {
          const removed = updated.slice(0, updated.length - MAX_FAX_ARCHIVE);
          removed.forEach(fax => {
            if (fax.imageDataUrl?.startsWith('blob:')) {
              URL.revokeObjectURL(fax.imageDataUrl);
              blobUrlsRef.current.delete(fax.imageDataUrl);
            }
          });
        }
        
        return trimmed;
      });
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async (messageContent) => {
    const payload = {
      message: messageContent,
      timestamp: Date.now(),
      sender: 'fax-user'
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
        maxAttempts: DEFAULT_RETRY_ATTEMPTS,
        baseDelay: DEFAULT_RETRY_BASE_DELAY,
        onRetry: (attempt, delay, error) => {
          logger.info(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) {
      return;
    }
    
    // Check if outgoing webhook is configured
    if (!webhooks.outgoingUrl) {
      logger.error('Outgoing webhook URL not configured');
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
      await sendMessage(messageToSend);

      // Clear input after successful send
      setInputValue('');
      setPendingMessage(null);
      setIsSending(false);
      
      // Show success toast briefly
      setToast({
        message: 'Fax sent successfully',
        type: 'success'
      });
    } catch (error) {
      logger.error('Error sending fax:', error);
      setIsSending(false);
      
      // Show error toast with retry button
      setToast({
        message: `Failed to send fax: ${error.message}`,
        type: 'error',
        onRetry: () => handleRetry()
      });
    }
  };

  const handleRetry = async () => {
    if (!pendingMessage || isSending) return;

    // Close current toast
    setToast(null);
    setIsSending(true);

    try {
      await sendMessage(pendingMessage);

      // Clear input and pending message after successful retry
      setInputValue('');
      setPendingMessage(null);
      setIsSending(false);
      
      // Show success toast
      setToast({
        message: 'Fax sent successfully',
        type: 'success'
      });
    } catch (error) {
      logger.error('Retry failed:', error);
      setIsSending(false);
      
      // Show error toast again with retry button
      setToast({
        message: `Failed to send fax: ${error.message}`,
        type: 'error',
        onRetry: () => handleRetry()
      });
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleFaxClick = (fax) => {
    setSelectedFax(fax);
  };

  const handleCloseModal = () => {
    setSelectedFax(null);
  };

  return (
    <div className="FaxInterface">
      <div className="FaxInterface__header">
        <div className="FaxInterface__title">FAX MACHINE</div>
        <div className="FaxInterface__status">
          {isTransmitting ? 'TRANSMITTING...' : 'READY'}
        </div>
      </div>

      <div className="FaxInterface__display">
        <canvas
          ref={canvasRef}
          width={595}
          height={842}
          className="FaxInterface__canvas"
        />
      </div>

      <div className="FaxInterface__archive">
        <div className="FaxInterface__archive-title">RECEIVED DOCUMENTS</div>
        {renderingError && (
          <div className="FaxInterface__warning">
            ⚠️ Canvas rendering unavailable - displaying messages as text
          </div>
        )}
        <div className="FaxInterface__archive-grid">
          {faxArchive.slice().reverse().map((fax) => (
            <FaxThumbnail key={fax.id} fax={fax} onClick={handleFaxClick} />
          ))}
        </div>
      </div>

      <form className="FaxInterface__input-form" onSubmit={handleSubmit}>
        <label htmlFor="fax-message-input" className="sr-only">Type message to send</label>
        <input
          id="fax-message-input"
          type="text"
          className="FaxInterface__input"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type message to send..."
          disabled={isSending}
          aria-label="Fax message input"
        />
        <button 
          type="submit" 
          className={`FaxInterface__send-btn ${isSending ? 'FaxInterface__send-btn--loading' : ''}`}
          disabled={isSending}
        >
          {isSending ? (
            <>
              <span className="FaxInterface__spinner" />
              SENDING...
            </>
          ) : (
            'SEND FAX'
          )}
        </button>
      </form>

      {selectedFax && (
        <div className="FaxInterface__modal" onClick={handleCloseModal}>
          <div className="FaxInterface__modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="FaxInterface__modal-close" 
              onClick={handleCloseModal}
              aria-label="Close fax preview"
            >
              ×
            </button>
            {selectedFax.isFallback ? (
              <div className="FaxInterface__modal-text">
                <div className="FaxInterface__modal-text-header">
                  FAX TRANSMISSION (TEXT MODE)
                </div>
                <div className="FaxInterface__modal-text-content">
                  {selectedFax.content}
                </div>
              </div>
            ) : (
              <img
                src={selectedFax.imageDataUrl}
                alt={`Fax from ${selectedFax.sender || 'Unknown'}`}
                className="FaxInterface__modal-img"
              />
            )}
            <div className="FaxInterface__modal-info">
              <div>From: {selectedFax.sender || 'Unknown'}</div>
              <div>Time: {new Date(selectedFax.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onRetry={toast.onRetry}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
};

export default React.memo(FaxInterface);
