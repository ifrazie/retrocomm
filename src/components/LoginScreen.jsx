import React, { useState } from 'react';
import './LoginScreen.css';

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(username.trim());
    } catch (err) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
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
              SYSTEM READY
              <br />
              ENTER USERNAME TO CONNECT
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
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="login-error">
                  ✗ ERROR: {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? '⏳ CONNECTING...' : '→ CONNECT'}
              </button>
            </form>

            <div className="login-info">
              <div className="login-info-line">
                ℹ No password required for demo
              </div>
              <div className="login-info-line">
                ℹ Username will be visible to others
              </div>
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

export default LoginScreen;
