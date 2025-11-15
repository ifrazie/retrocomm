import React, { useEffect } from 'react';
import '../styles/toast.css';

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Notification message
 * @param {string} props.type - 'success' | 'error' | 'info' | 'warning'
 * @param {number} props.duration - Display duration in ms (default: 3000)
 * @param {function} props.onClose - Callback when toast closes
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{getIcon(type)}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when parent re-renders
export default React.memo(Toast);
