import React, { useState } from 'react';
import StatusIndicator from './StatusIndicator.jsx';
import WebhookConfig from './WebhookConfig.jsx';
import { useConnectionStatus } from '../hooks/useConnectionStatus.js';

/**
 * Example usage of StatusIndicator component
 * This demonstrates how to integrate StatusIndicator with useConnectionStatus hook
 */
const StatusIndicatorExample = () => {
  const [showConfig, setShowConfig] = useState(false);
  
  // Use the connection status hook
  // Pass SSE connection object when available (e.g., from useSSE hook)
  const { status, markSendSuccess, markSendFailure } = useConnectionStatus(null);

  const _handleConfigureClick = () => {
    setShowConfig(true);
  };

  const _handleCloseConfig = () => {
    setShowConfig(false);
  };

  return (
    <div>
      <StatusIndicator 
        status={status} 
        onConfigureClick={_handleConfigureClick}
      />
      
      {showConfig && (
        <div style={{ marginTop: '1rem' }}>
          <WebhookConfig onClose={_handleCloseConfig} />
        </div>
      )}
      
      {/* Example: Update status on message send */}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => markSendSuccess()}>
          Simulate Send Success
        </button>
        <button onClick={() => markSendFailure('Network error')}>
          Simulate Send Failure
        </button>
      </div>
    </div>
  );
};

export default StatusIndicatorExample;
