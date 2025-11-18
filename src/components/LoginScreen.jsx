import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MAX_USERNAME_LENGTH } from '../utils/constants';
import './LoginScreen.css';

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(username.trim(), password, mode === 'register');
    } catch (err) {
      setError(err.message || `${mode === 'register' ? 'Registration' : 'Login'} failed`);
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>⚡ RETRO MESSENGER ⚡</h1>
          <div className="login-subtitle">
            MULTIUSER PAGER NETWORK
          </div>
        </div>

        <div className="login-device">
          <div className="login-display">
            <div className="login-prompt">
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              <br />
              {mode === 'register' ? 'NEW USER REGISTRATION' : 'SYSTEM READY'}
              <br />
              {mode === 'register' ? 'CREATE SECURE ACCOUNT' : 'ENTER CREDENTIALS TO CONNECT'}
              <br />
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input-group">
                <label htmlFor="username" className="login-label">
                  USERNAME:
                </label>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your handle..."
                  disabled={isLoading}
                  autoFocus
                  maxLength={MAX_USERNAME_LENGTH}
                />
              </div>

              <div className="login-input-group">
                <label htmlFor="password" className="login-label">
                  PASSWORD:
                </label>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 6 characters...' : 'Enter password...'}
                  disabled={isLoading}
                  minLength={mode === 'register' ? 6 : undefined}
                />
              </div>

              {mode === 'register' && (
                <div className="login-input-group">
                  <label htmlFor="confirmPassword" className="login-label">
                    CONFIRM:
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password..."
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <div className="login-error">
                  ✗ ERROR: {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={isLoading || !username.trim() || !password}
              >
                {isLoading 
                  ? '⏳ PROCESSING...' 
                  : mode === 'register' 
                    ? '→ REGISTER' 
                    : '→ LOGIN'}
              </button>

              <button
                type="button"
                className="login-toggle-button"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {mode === 'register' 
                  ? '← Back to Login' 
                  : '→ New User? Register'}
              </button>
            </form>

            <div className="login-info">
              <div className="login-info-line">
                🔒 End-to-end encrypted messaging
              </div>
              <div className="login-info-line">
                🔑 Password protects your private key
              </div>
              {mode === 'register' && (
                <div className="login-info-line">
                  ⚠ Remember your password - cannot be reset
                </div>
              )}
            </div>
          </div>

          <div className="login-device-label">
            RETROPAGER 9000 | NETWORK TERMINAL | EST. 1994
          </div>
        </div>

        <div className="login-footer">
          🎃 Kiroween Hackathon 2025 | Multiuser Edition
        </div>
      </div>
    </div>
  );
}

LoginScreen.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default React.memo(LoginScreen);
