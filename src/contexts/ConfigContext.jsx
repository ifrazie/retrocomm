import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  const setWebhooks = useCallback((newWebhooks) => {
    setWebhooksState(prev => {
      const updatedWebhooks = { ...prev, ...newWebhooks };
      saveWebhookSettings(updatedWebhooks);
      return updatedWebhooks;
    });
  }, []);

  /**
   * Update user preferences
   * @param {Partial<import('../types/index.js').AppPreferences>} newPreferences - Preferences to update
   */
  const setPreferences = useCallback((newPreferences) => {
    setPreferencesState(prev => {
      const updatedPreferences = { ...prev, ...newPreferences };
      savePreferences(updatedPreferences);
      return updatedPreferences;
    });
  }, []);

  /**
   * Update only the mode preference
   * @param {'pager' | 'fax'} mode - Interface mode
   */
  const setMode = useCallback((mode) => {
    setPreferences({ mode });
  }, [setPreferences]);

  /**
   * Toggle sound enabled preference
   */
  const toggleSound = useCallback(() => {
    setPreferencesState(prev => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      savePreferences(updated);
      return updated;
    });
  }, []);

  /**
   * Update layout variant preference
   * @param {'default' | 'compact' | 'experimental'} variant - Layout variant
   */
  const setLayoutVariant = useCallback((variant) => {
    setPreferences({ layoutVariant: variant });
  }, [setPreferences]);

  /**
   * Update incoming webhook URL
   * @param {string} url - Incoming webhook URL
   */
  const setIncomingUrl = useCallback((url) => {
    setWebhooks({ incomingUrl: url });
  }, [setWebhooks]);

  /**
   * Update outgoing webhook URL
   * @param {string} url - Outgoing webhook URL
   */
  const setOutgoingUrl = useCallback((url) => {
    setWebhooks({ outgoingUrl: url });
  }, [setWebhooks]);

  /**
   * Update authentication token
   * @param {string} token - Auth token
   */
  const setAuthToken = useCallback((token) => {
    setWebhooks({ authToken: token });
  }, [setWebhooks]);

  /**
   * Toggle authentication enabled
   */
  const toggleAuth = useCallback(() => {
    setWebhooksState(prev => {
      const updated = { ...prev, enableAuth: !prev.enableAuth };
      saveWebhookSettings(updated);
      return updated;
    });
  }, []);

  /**
   * Reset all configuration to defaults
   */
  const resetConfig = useCallback(() => {
    setWebhooksState(defaultWebhooks);
    setPreferencesState(defaultPreferences);
    saveWebhookSettings(defaultWebhooks);
    savePreferences(defaultPreferences);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  // Only recalculate when webhooks, preferences, or isLoaded actually change
  // Functions are stable due to useCallback, so we don't include them in dependencies
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

