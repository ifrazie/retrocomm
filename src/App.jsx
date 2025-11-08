import React, { useState } from 'react';
import { MessageProvider } from './contexts/MessageContext.jsx';
import { ConfigProvider, useConfig } from './contexts/ConfigContext.jsx';
import { useSSE } from './hooks/useSSE.js';
import { useConnectionStatus } from './hooks/useConnectionStatus.js';
import PagerInterface from './components/PagerInterface.jsx';
import FaxInterface from './components/FaxInterface.jsx';
import StatusIndicator from './components/StatusIndicator.jsx';
import ModeToggle from './components/ModeToggle.jsx';
import WebhookConfig from './components/WebhookConfig.jsx';
import './App.css';

/**
 * ErrorBoundary Component
 * Catches errors in child components and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  _handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="ErrorBoundary">
          <div className="ErrorBoundary__content">
            <h1>Something went wrong</h1>
            <p>An error occurred while rendering the application.</p>
            {this.state.error && (
              <details className="ErrorBoundary__details">
                <summary>Error details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            <button onClick={this._handleReset} className="ErrorBoundary__reset-btn">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * AppContent Component
 * Main application content with interface rendering
 * Separated from App to access ConfigContext
 */
const AppContent = () => {
  const { preferences, isLoaded } = useConfig();
  const [showConfig, setShowConfig] = useState(false);

  // Connect to SSE endpoint for real-time messages
  const sseConnection = useSSE('/api/messages/stream', true);
  
  // Monitor connection status
  const { status } = useConnectionStatus(sseConnection.eventSource);

  const _handleConfigureClick = () => {
    setShowConfig(true);
  };

  const _handleCloseConfig = () => {
    setShowConfig(false);
  };

  // Wait for config to load before rendering
  if (!isLoaded) {
    return (
      <div className="App__loading">
        <div className="App__loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App__header">
        <div className="App__header-left">
          <h1 className="App__title">Retro Messenger</h1>
          <StatusIndicator 
            status={status} 
            onConfigureClick={_handleConfigureClick}
          />
        </div>
        <div className="App__header-right">
          <ModeToggle />
          <button 
            className="App__settings-btn"
            onClick={_handleConfigureClick}
            aria-label="Open settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="App__main">
        <ErrorBoundary>
          <div className={`App__interface-container App__interface-container--${preferences.mode}`}>
            {preferences.mode === 'pager' ? (
              <PagerInterface />
            ) : (
              <FaxInterface />
            )}
          </div>
        </ErrorBoundary>
      </main>

      {showConfig && (
        <div className="App__modal-overlay" onClick={_handleCloseConfig}>
          <div className="App__modal-content" onClick={(e) => e.stopPropagation()}>
            <WebhookConfig onClose={_handleCloseConfig} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * App Component
 * Root component with context providers
 */
const App = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <MessageProvider>
          <AppContent />
        </MessageProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
