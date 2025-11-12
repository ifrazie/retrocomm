import React from 'react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import './ModeToggle.css';

/**
 * ModeToggle Component
 * Provides a toggle switch to switch between pager and fax interface modes
 * Persists mode preference to LocalStorage via ConfigContext
 */
const ModeToggle = () => {
  const { preferences, setMode } = useConfig();
  const currentMode = preferences.mode;

  const _handleToggle = () => {
    const newMode = currentMode === 'pager' ? 'fax' : 'pager';
    setMode(newMode);
  };

  return (
    <div className="ModeToggle">
      <button
        className={`ModeToggle__button ${currentMode === 'pager' ? 'is-active' : ''}`}
        onClick={() => setMode('pager')}
        aria-label="Switch to pager mode"
        aria-pressed={currentMode === 'pager'}
      >
        📟 Pager Mode
      </button>
      <button
        className={`ModeToggle__button ${currentMode === 'fax' ? 'is-active' : ''}`}
        onClick={() => setMode('fax')}
        aria-label="Switch to fax mode"
        aria-pressed={currentMode === 'fax'}
      >
        📠 Fax Mode
      </button>
    </div>
  );
};

export default ModeToggle;
