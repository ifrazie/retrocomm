import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../utils/logger';
import './ErrorBoundary.css';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        logger.error('Error boundary caught error:', error);
        logger.error('Error info:', errorInfo);
        
        this.setState({
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        
        // Optionally reload the page for a fresh start
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI with retro styling
            return (
                <div className="error-boundary">
                    <div className="error-boundary-container">
                        <div className="error-boundary-header">
                            <h1>⚠️ SYSTEM ERROR ⚠️</h1>
                        </div>
                        
                        <div className="error-boundary-content">
                            <div className="error-boundary-message">
                                <p className="error-boundary-title">
                                    CRITICAL MALFUNCTION DETECTED
                                </p>
                                <p className="error-boundary-description">
                                    The retro messenger has encountered an unexpected error.
                                    <br />
                                    Please try refreshing the page or contact support.
                                </p>
                                
                                {this.state.error && (
                                    <div className="error-boundary-details">
                                        <p className="error-boundary-error-name">
                                            ERROR: {this.state.error.toString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="error-boundary-actions">
                                <button
                                    className="error-boundary-button"
                                    onClick={this.handleReset}
                                >
                                    → TRY AGAIN
                                </button>
                                <button
                                    className="error-boundary-button"
                                    onClick={() => window.location.reload()}
                                >
                                    → RELOAD PAGE
                                </button>
                            </div>
                        </div>
                        
                        <div className="error-boundary-footer">
                            RETRO MESSENGER v1.0 | ERROR CODE: {Date.now()}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    onReset: PropTypes.func
};

export default ErrorBoundary;
