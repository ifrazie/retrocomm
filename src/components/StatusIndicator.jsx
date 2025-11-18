import React from 'react';
import './StatusIndicator.css';

/**
 * StatusIndicator Component
 * Displays connection status with visual indicators and configuration prompts
 * 
 * @param {Object} props
 * @param {import('../types/index.js').ConnectionStatus} props.status - Connection status object
 * @param {Function} [props.onConfigureClick] - Callback when configure button is clicked
 */
const StatusIndicator = ({ status, onConfigureClick }) => {
  /**
   * Determine status type based on connection state
   * @returns {'connected' | 'disconnected' | 'error'}
   */
  const getStatusType = () => {
    if (status.error) {
      return 'error';
    }
    return status.connected ? 'connected' : 'disconnected';
  };

  /**
   * Get status label text
   * @returns {string}
   */
  const getStatusLabel = () => {
    const statusType = getStatusType();
    switch (statusType) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  /**
   * Get status description text
   * @returns {string}
   */
  const getStatusDescription = () => {
    const statusType = getStatusType();
    switch (statusType) {
      case 'connected':
        return 'Ready to send and receive messages';
      case 'error':
        return status.error || 'Connection error occurred';
      case 'disconnected':
      default:
        return 'Webhooks not configured';
    }
  };

  const statusType = getStatusType();
  const showConfigPrompt = statusType === 'disconnected' && onConfigureClick;

  return (
    <div className="StatusIndicator">
      <div className={`StatusIndicator__indicator StatusIndicator__indicator--${statusType}`}>
        <span className="StatusIndicator__dot" />
        <span className="StatusIndicator__label">{getStatusLabel()}</span>
      </div>
      
      <div className="StatusIndicator__details">
        <p className="StatusIndicator__description">
          {getStatusDescription()}
        </p>
        
        {showConfigPrompt && (
          <button
            className="StatusIndicator__configure-btn"
            onClick={onConfigureClick}
          >
            Configure Webhooks
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;
