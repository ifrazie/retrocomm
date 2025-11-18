import React from 'react';
import { logger } from '../utils/logger';
import './ErrorBoundary.css';

/**
 * Error Boundary component to catch and handle React errors gracefully
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-boundary-header">
              <h1>⚠️ SYSTEM ERROR ⚠️</h1>
              <div className="error-boundary-subtitle">
                RETRO MESSENGER ENCOUNTERED AN ERROR
              </div>
            </div>

            <div className="error-boundary-content">
              <div className="error-boundary-message">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                <br />
                ERROR: APPLICATION MALFUNCTION
                <br />
                STATUS: CRITICAL
                <br />
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>

              <p className="error-boundary-description">
                Something went wrong with the application.
                <br />
                Please try refreshing the page.
              </p>

              <button
                className="error-boundary-button"
                onClick={this.handleReset}
              >
                🔄 RESTART SYSTEM
              </button>
            </div>

            <div className="error-boundary-footer">
              RETROPAGER 9000 | ERROR HANDLER v1.0
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
