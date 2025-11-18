import React, { useState, useMemo } from 'react';
import { useMessages } from '../contexts/MessageContext.jsx';
import { useConnectionStatus } from '../hooks/useConnectionStatus.js';
import { StatsSkeleton } from './SkeletonLoader.jsx';
import './ControlSidebar.css';

/**
 * ControlSidebar Component
 * Displays quick actions, message statistics, and webhook status
 * Designed for experimental layout variant
 * Collapsible on mobile devices
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.sseConnection] - SSE connection object for status monitoring
 * @param {Function} [props.onClearHistory] - Callback when clear history is clicked
 * @param {Function} [props.onExportMessages] - Callback when export messages is clicked
 */
const ControlSidebar = ({ sseConnection, onClearHistory, onExportMessages }) => {
  const { messages, clearHistory } = useMessages();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get connection status from SSE connection
  const { status } = useConnectionStatus(sseConnection?.eventSource);

  // Simulate initial loading state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate message statistics
  const stats = useMemo(() => {
    const total = messages.length;
    const sent = messages.filter(msg => msg.sender === 'user' || msg.sender === 'You').length;
    const received = total - sent;
    
    // Calculate messages in last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentMessages = messages.filter(msg => {
      const msgTime = new Date(msg.timestamp).getTime();
      return msgTime > oneHourAgo;
    });

    return {
      total,
      sent,
      received,
      recent: recentMessages.length
    };
  }, [messages]);

  // Get webhook status type
  const getStatusType = () => {
    if (status.error) return 'error';
    return status.connected ? 'connected' : 'disconnected';
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all message history?')) {
      clearHistory();
      if (onClearHistory) {
        onClearHistory();
      }
    }
  };

  const handleExportMessages = () => {
    if (onExportMessages) {
      onExportMessages();
    } else {
      // Default export functionality
      const dataStr = JSON.stringify(messages, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `retro-messages-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const statusType = getStatusType();

  return (
    <aside 
      className={`ControlSidebar ${isCollapsed ? 'ControlSidebar--collapsed' : ''}`}
      aria-label="Control sidebar with message statistics and quick actions"
      role="complementary"
    >
      <button
        className="ControlSidebar__toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        aria-controls="sidebar-content"
      >
        <span className="ControlSidebar__toggle-icon" aria-hidden="true">
          {isCollapsed ? '▶' : '◀'}
        </span>
      </button>

      {!isCollapsed && (
        <div className="ControlSidebar__content" id="sidebar-content">
          {/* Webhook Status Section */}
          <section className="ControlSidebar__section" aria-labelledby="webhook-status-heading">
            <h3 className="ControlSidebar__section-title" id="webhook-status-heading">
              <span className="ControlSidebar__icon" aria-hidden="true">📡</span>
              WEBHOOK STATUS
            </h3>
            <div 
              className={`ControlSidebar__status ControlSidebar__status--${statusType}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="ControlSidebar__status-indicator">
                <span 
                  className="ControlSidebar__status-dot" 
                  aria-hidden="true"
                />
                <span className="ControlSidebar__status-label">
                  {statusType === 'connected' ? 'ONLINE' : 
                   statusType === 'error' ? 'ERROR' : 'OFFLINE'}
                </span>
              </div>
              <p className="ControlSidebar__status-text">
                {statusType === 'connected' ? 'Ready to transmit' :
                 statusType === 'error' ? status.error || 'Connection failed' :
                 'Not configured'}
              </p>
            </div>
          </section>

          {/* Message Statistics Section */}
          <section className="ControlSidebar__section" aria-labelledby="message-stats-heading">
            <h3 className="ControlSidebar__section-title" id="message-stats-heading">
              <span className="ControlSidebar__icon" aria-hidden="true">📊</span>
              MESSAGE STATS
            </h3>
            {isLoading ? (
              <StatsSkeleton />
            ) : (
              <div className="ControlSidebar__stats" role="group" aria-label="Message statistics">
                <div className="ControlSidebar__stat">
                  <span className="ControlSidebar__stat-label" id="stat-total-label">TOTAL</span>
                  <span className="ControlSidebar__stat-value" aria-labelledby="stat-total-label">{stats.total}</span>
                </div>
                <div className="ControlSidebar__stat">
                  <span className="ControlSidebar__stat-label" id="stat-sent-label">SENT</span>
                  <span className="ControlSidebar__stat-value" aria-labelledby="stat-sent-label">{stats.sent}</span>
                </div>
                <div className="ControlSidebar__stat">
                  <span className="ControlSidebar__stat-label" id="stat-received-label">RECEIVED</span>
                  <span className="ControlSidebar__stat-value" aria-labelledby="stat-received-label">{stats.received}</span>
                </div>
                <div className="ControlSidebar__stat">
                  <span className="ControlSidebar__stat-label" id="stat-recent-label">LAST HOUR</span>
                  <span className="ControlSidebar__stat-value" aria-labelledby="stat-recent-label">{stats.recent}</span>
                </div>
              </div>
            )}
          </section>

          {/* Quick Actions Section */}
          <section className="ControlSidebar__section" aria-labelledby="quick-actions-heading">
            <h3 className="ControlSidebar__section-title" id="quick-actions-heading">
              <span className="ControlSidebar__icon" aria-hidden="true">⚡</span>
              QUICK ACTIONS
            </h3>
            <div className="ControlSidebar__actions" role="group" aria-labelledby="quick-actions-heading">
              <button
                className="ControlSidebar__action-btn"
                onClick={handleClearHistory}
                disabled={messages.length === 0}
                aria-label={`Clear message history (${stats.total} messages)`}
                aria-describedby="clear-history-desc"
              >
                <span className="ControlSidebar__action-icon" aria-hidden="true">🗑️</span>
                <span className="ControlSidebar__action-text">CLEAR HISTORY</span>
                <span id="clear-history-desc" className="sr-only">
                  Permanently delete all {stats.total} messages from history
                </span>
              </button>
              <button
                className="ControlSidebar__action-btn"
                onClick={handleExportMessages}
                disabled={messages.length === 0}
                aria-label={`Export ${stats.total} messages to JSON file`}
                aria-describedby="export-messages-desc"
              >
                <span className="ControlSidebar__action-icon" aria-hidden="true">💾</span>
                <span className="ControlSidebar__action-text">EXPORT DATA</span>
                <span id="export-messages-desc" className="sr-only">
                  Download all messages as a JSON file
                </span>
              </button>
            </div>
          </section>
        </div>
      )}
    </aside>
  );
};

export default ControlSidebar;
