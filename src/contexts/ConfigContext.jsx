import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  getWebhookSettings, 
  saveWebhookSettings, 
  getPreferences, 
  savePreferences 
} from '../utils/storage.js';

// Default configuration values
const defaultWebhooks = {
  incomingUrl: '',
  outgoingUrl: '',
  authToken: '',
  enableAuth: false
};

const defaultPreferences = {
  mode: 'pager',
  soundEnabled: true,
  layoutVariant: 'default'
};

// Create context
const ConfigContext = createContext(undefined);

/**
 * ConfigProvider component
 * Manages webhook settings and user preferences with LocalStorage persistence
 */
export const ConfigProvider = ({ children }) => {
  const [webhooks, setWebhooksState] = useState(defaultWebhooks);
  const [preferences, setPreferencesState] = useState(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedWebhooks = getWebhookSettings();
    const savedPreferences = getPreferences();

    if (savedWebhooks) {
      setWebhooksState({ ...defaultWebhooks, ...savedWebhooks });
    }

    if (savedPreferences) {
      setPreferencesState({ ...defaultPreferences, ...savedPreferences });
    }

    setIsLoaded(true);
  }, []);

  /**
   * Update webhook settings
   * @param {Partial<import('../types/index.js').WebhookSettings>} newWebhooks - Webhook settings to update
   */
  const setWebhooks = (newWebhooks) => {
    const updatedWebhooks = { ...webhooks, ...newWebhooks };
    setWebhooksState(updatedWebhooks);
    saveWebhookSettings(updatedWebhooks);
  };

  /**
   * Update user preferences
   * @param {Partial<import('../types/index.js').AppPreferences>} newPreferences - Preferences to update
   */
  const setPreferences = (newPreferences) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferencesState(updatedPreferences);
    savePreferences(updatedPreferences);
  };

  /**
   * Update only the mode preference
   * @param {'pager' | 'fax'} mode - Interface mode
   */
  const setMode = (mode) => {
    setPreferences({ mode });
  };

  /**
   * Toggle sound enabled preference
   */
  const toggleSound = () => {
    setPreferences({ soundEnabled: !preferences.soundEnabled });
  };

  /**
   * Update layout variant preference
   * @param {'default' | 'compact' | 'experimental'} variant - Layout variant
   */
  const setLayoutVariant = (variant) => {
    setPreferences({ layoutVariant: variant });
  };

  /**
   * Update incoming webhook URL
   * @param {string} url - Incoming webhook URL
   */
  const setIncomingUrl = (url) => {
    setWebhooks({ incomingUrl: url });
  };

  /**
   * Update outgoing webhook URL
   * @param {string} url - Outgoing webhook URL
   */
  const setOutgoingUrl = (url) => {
    setWebhooks({ outgoingUrl: url });
  };

  /**
   * Update authentication token
   * @param {string} token - Auth token
   */
  const setAuthToken = (token) => {
    setWebhooks({ authToken: token });
  };

  /**
   * Toggle authentication enabled
   */
  const toggleAuth = () => {
    setWebhooks({ enableAuth: !webhooks.enableAuth });
  };

  /**
   * Reset all configuration to defaults
   */
  const resetConfig = () => {
    setWebhooksState(defaultWebhooks);
    setPreferencesState(defaultPreferences);
    saveWebhookSettings(defaultWebhooks);
    savePreferences(defaultPreferences);
  };

  // Memoize context value to prevent unnecessary re-renders of consumers
  // Only recalculate when webhooks, preferences, or isLoaded actually change
  const value = useMemo(() => ({
    webhooks,
    preferences,
    isLoaded,
    setWebhooks,
    setPreferences,
    setMode,
    toggleSound,
    setLayoutVariant,
    setIncomingUrl,
    setOutgoingUrl,
    setAuthToken,
    toggleAuth,
    resetConfig
  }), [
    webhooks,
    preferences,
    isLoaded,
    setWebhooks,
    setPreferences,
    setMode,
    toggleSound,
    setLayoutVariant,
    setIncomingUrl,
    setOutgoingUrl,
    setAuthToken,
    toggleAuth,
    resetConfig
  ]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to use ConfigContext
 * @returns {Object} Config context value
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

