import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { getMessageHistory, saveMessageHistory } from '../utils/storage.js';
import { MAX_STORED_MESSAGES } from '../utils/constants.js';

// Action types
const ADD_MESSAGE = 'ADD_MESSAGE';
const CLEAR_HISTORY = 'CLEAR_HISTORY';
const SET_MESSAGES = 'SET_MESSAGES';

// Initial state
const initialState = {
  messages: []
};

/**
 * Message reducer to manage message queue
 * Maintains a maximum of 100 messages
 */
const messageReducer = (state, action) => {
  switch (action.type) {
    case ADD_MESSAGE: {
      const newMessages = [...state.messages, action.payload];
      // Limit to MAX_STORED_MESSAGES
      const limitedMessages = newMessages.slice(-MAX_STORED_MESSAGES);
      return {
        ...state,
        messages: limitedMessages
      };
    }

    case CLEAR_HISTORY:
      return {
        ...state,
        messages: []
      };

    case SET_MESSAGES: {
      // Limit to MAX_STORED_MESSAGES when setting
      const limitedMessages = action.payload.slice(-MAX_STORED_MESSAGES);
      return {
        ...state,
        messages: limitedMessages
      };
    }

    default:
      return state;
  }
};

// Create context
const MessageContext = createContext(undefined);

/**
 * MessageProvider component
 * Manages message state and provides actions to child components
 */
export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = getMessageHistory(MAX_STORED_MESSAGES);
    if (savedMessages && savedMessages.length > 0) {
      dispatch({ type: SET_MESSAGES, payload: savedMessages });
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (state.messages.length > 0) {
      saveMessageHistory(state.messages);
    }
  }, [state.messages]);

  /**
   * Add a new message to the queue
   * @param {import('../types/index.js').Message} message - Message to add
   */
  const addMessage = (message) => {
    dispatch({ type: ADD_MESSAGE, payload: message });
  };

  /**
   * Clear all messages from history
   */
  const clearHistory = () => {
    dispatch({ type: CLEAR_HISTORY });
    saveMessageHistory([]);
  };

  /**
   * Set messages (replace entire message array)
   * @param {import('../types/index.js').Message[]} messages - Messages to set
   */
  const setMessages = (messages) => {
    dispatch({ type: SET_MESSAGES, payload: messages });
  };

  // Memoize context value to prevent unnecessary re-renders of consumers
  // Only recalculate when messages array actually changes
  const value = useMemo(() => ({
    messages: state.messages,
    addMessage,
    clearHistory,
    setMessages
  }), [state.messages, addMessage, clearHistory, setMessages]);

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

/**
 * Hook to use MessageContext
 * @returns {Object} Message context value
 */
export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

// Export action types for testing
export { ADD_MESSAGE, CLEAR_HISTORY, SET_MESSAGES };

