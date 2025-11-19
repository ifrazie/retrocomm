import { useEffect, useRef, useState, useCallback } from 'react';
import { useMessages } from '../contexts/MessageContext.jsx';
import { logger } from '../utils/logger.js';

/**
 * Custom hook for Server-Sent Events (SSE) connection
 * Connects to the backend SSE endpoint and receives real-time messages
 * Implements automatic reconnection with exponential backoff
 * 
 * @param {string} url - SSE endpoint URL (e.g., '/api/messages/stream')
 * @param {boolean} enabled - Whether SSE connection should be active
 * @returns {Object} SSE connection state and control functions
 */
export const useSSE = (url, enabled = true) => {
  const { addMessage } = useMessages();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const [connectionState, setConnectionState] = useState({
    connected: false,
    reconnecting: false,
    error: null
  });

  /**
   * Calculate reconnection delay using exponential backoff
   * Delays: 1s, 2s, 4s, 8s (max)
   * @returns {number} Delay in milliseconds
   */
  const _getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current;
    const delays = [1000, 2000, 4000, 8000];
    return delays[Math.min(attempt, delays.length - 1)];
  }, []);

  /**
   * Parse incoming SSE message event
   * @param {MessageEvent} event - SSE message event
   */
  const _handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Validate message structure
      if (!data.id || !data.content || !data.timestamp) {
        logger.error('Invalid message format received:', data);
        return;
      }

      // Add message to context
      addMessage({
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        sender: data.sender,
        metadata: data.metadata
      });

      // Reset reconnect attempts on successful message
      reconnectAttemptsRef.current = 0;
    } catch (error) {
      logger.error('Error parsing SSE message:', error);
    }
  }, [addMessage]);

  /**
   * Handle SSE connection open
   */
  const _handleOpen = useCallback(() => {
    logger.info('SSE connection established');
    setConnectionState({
      connected: true,
      reconnecting: false,
      error: null
    });
    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Handle SSE connection error
   */
  const _handleError = useCallback((error) => {
    logger.error('SSE connection error:', error);
    
    // EventSource automatically tries to reconnect, but we'll handle it manually
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionState(prev => ({
      connected: false,
      reconnecting: true,
      error: 'Connection lost'
    }));

    // Schedule reconnection with exponential backoff
    const delay = _getReconnectDelay();
    logger.info(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      _connect();
    }, delay);
  }, [_getReconnectDelay]);

  /**
   * Establish SSE connection
   */
  const _connect = useCallback(() => {
    // Don't connect if disabled or already connected
    if (!enabled || eventSourceRef.current) {
      return;
    }

    try {
      logger.info('Connecting to SSE endpoint:', url);
      const eventSource = new EventSource(url);

      eventSource.addEventListener('open', _handleOpen);
      eventSource.addEventListener('error', _handleError);
      eventSource.addEventListener('message', _handleMessage);

      eventSourceRef.current = eventSource;
    } catch (error) {
      logger.error('Failed to create SSE connection:', error);
      setConnectionState({
        connected: false,
        reconnecting: false,
        error: error.message
      });
    }
  }, [url, enabled, _handleOpen, _handleError, _handleMessage]);

  /**
   * Close SSE connection
   */
  const _disconnect = useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionState({
      connected: false,
      reconnecting: false,
      error: null
    });

    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    _disconnect();
    reconnectAttemptsRef.current = 0;
    _connect();
  }, [_disconnect, _connect]);

  // Connect when enabled, disconnect when disabled
  useEffect(() => {
    if (enabled) {
      _connect();
    } else {
      _disconnect();
    }

    // Cleanup on unmount
    return () => {
      _disconnect();
    };
  }, [enabled, _connect, _disconnect]);

  return {
    connected: connectionState.connected,
    reconnecting: connectionState.reconnecting,
    error: connectionState.error,
    reconnect,
    eventSource: eventSourceRef.current
  };
};
