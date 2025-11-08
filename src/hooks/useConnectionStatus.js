import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '../contexts/ConfigContext.jsx';

/**
 * Custom hook to manage connection status
 * Monitors webhook configuration and SSE connection state
 * 
 * @param {Object} sseConnection - SSE connection object with readyState property
 * @returns {Object} Connection status and update functions
 */
export const useConnectionStatus = (sseConnection = null) => {
  const { webhooks } = useConfig();
  
  const [status, setStatus] = useState({
    connected: false,
    error: null,
    lastUpdate: Date.now()
  });

  /**
   * Check if webhooks are properly configured
   * @returns {boolean}
   */
  const _areWebhooksConfigured = useCallback(() => {
    // At minimum, we need an outgoing webhook URL to send messages
    return !!(webhooks.outgoingUrl && webhooks.outgoingUrl.trim().length > 0);
  }, [webhooks.outgoingUrl]);

  /**
   * Check SSE connection state
   * @returns {boolean}
   */
  const _isSSEConnected = useCallback(() => {
    if (!sseConnection) {
      return true; // If no SSE connection provided, don't block on it
    }
    
    // EventSource.OPEN = 1
    return sseConnection.readyState === 1;
  }, [sseConnection]);

  /**
   * Update connection status based on current state
   */
  const _updateStatus = useCallback(() => {
    const webhooksConfigured = _areWebhooksConfigured();
    const sseConnected = _isSSEConnected();
    
    setStatus(prev => {
      const newConnected = webhooksConfigured && sseConnected;
      
      // Only update if status actually changed
      if (prev.connected === newConnected && !prev.error) {
        return prev;
      }
      
      return {
        connected: newConnected,
        error: null,
        lastUpdate: Date.now()
      };
    });
  }, [_areWebhooksConfigured, _isSSEConnected]);

  /**
   * Set error state
   * @param {string} errorMessage - Error message to display
   */
  const setError = useCallback((errorMessage) => {
    setStatus({
      connected: false,
      error: errorMessage,
      lastUpdate: Date.now()
    });
  }, []);

  /**
   * Clear error state and re-evaluate connection
   */
  const clearError = useCallback(() => {
    _updateStatus();
  }, [_updateStatus]);

  /**
   * Mark successful webhook send
   */
  const markSendSuccess = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      error: null,
      lastUpdate: Date.now()
    }));
  }, []);

  /**
   * Mark failed webhook send
   * @param {string} errorMessage - Error message
   */
  const markSendFailure = useCallback((errorMessage) => {
    setError(errorMessage || 'Failed to send message');
  }, [setError]);

  // Update status when webhooks configuration changes
  useEffect(() => {
    _updateStatus();
  }, [_updateStatus]);

  // Monitor SSE connection state changes
  useEffect(() => {
    if (!sseConnection) {
      return;
    }

    const handleOpen = () => {
      _updateStatus();
    };

    const handleError = () => {
      setError('Connection lost. Reconnecting...');
    };

    sseConnection.addEventListener('open', handleOpen);
    sseConnection.addEventListener('error', handleError);

    return () => {
      sseConnection.removeEventListener('open', handleOpen);
      sseConnection.removeEventListener('error', handleError);
    };
  }, [sseConnection, _updateStatus, setError]);

  return {
    status,
    setError,
    clearError,
    markSendSuccess,
    markSendFailure
  };
};
