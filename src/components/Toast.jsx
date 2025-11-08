import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Component
 * Displays temporary notification messages with optional retry action
 */
const Toast = ({ message, type = 'error', onRetry, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!onRetry && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onRetry, onClose]);

  const _handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className={`Toast Toast--${type}`}>
      <div className="Toast__content">
        <span className="Toast__message">{message}</span>
        <div className="Toast__actions">
          {onRetry && (
            <button className="Toast__retry-btn" onClick={_handleRetry}>
              Retry
            </button>
          )}
          <button className="Toast__close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
