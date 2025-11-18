import React from 'react';
import './LayoutToggle.css';

/**
 * LayoutToggle Component
 * Provides UI controls for switching between layout variants
 * Manages transition animations during variant changes
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentVariant - Currently active layout variant
 * @param {Function} props.onVariantChange - Callback when variant changes
 */
const LayoutToggle = ({ currentVariant = 'default', onVariantChange }) => {
  const variants = [
    { id: 'default', label: 'DEFAULT', icon: '▦', description: 'Two-column layout with sidebar' },
    { id: 'experimental', label: 'SPLIT', icon: '▥', description: 'Split-view layout with controls' },
    { id: 'compact', label: 'COMPACT', icon: '▬', description: 'Single-column maximized display' }
  ];

  const handleVariantChange = (newVariant) => {
    if (newVariant === currentVariant) return;

    // Trigger variant change - LayoutContainer handles transition animation
    if (onVariantChange) {
      onVariantChange(newVariant);
    }
  };

  const handleKeyDown = (event, variantId) => {
    // Support arrow key navigation
    const currentIndex = variants.findIndex(v => v.id === variantId);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % variants.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + variants.length) % variants.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = variants.length - 1;
    } else {
      return; // Let other keys work normally
    }

    // Focus the next button
    const buttons = document.querySelectorAll('.LayoutToggle__button');
    if (buttons[nextIndex]) {
      buttons[nextIndex].focus();
    }
  };

  return (
    <div className="LayoutToggle" role="toolbar" aria-label="Layout variant selector" aria-controls="layout-container">
      <span className="LayoutToggle__label" id="layout-toggle-label">LAYOUT:</span>
      <div className="LayoutToggle__buttons" role="group" aria-labelledby="layout-toggle-label">
        {variants.map((variant, index) => (
          <button
            key={variant.id}
            className={`LayoutToggle__button ${
              currentVariant === variant.id ? 'LayoutToggle__button--active' : ''
            }`}
            onClick={() => handleVariantChange(variant.id)}
            onKeyDown={(e) => handleKeyDown(e, variant.id)}
            aria-label={`${variant.label} layout: ${variant.description}`}
            aria-pressed={currentVariant === variant.id}
            aria-describedby={`layout-desc-${variant.id}`}
            title={`${variant.label} Layout`}
            tabIndex={currentVariant === variant.id ? 0 : -1}
          >
            <span className="LayoutToggle__icon" aria-hidden="true">{variant.icon}</span>
            <span className="LayoutToggle__text">{variant.label}</span>
            <span id={`layout-desc-${variant.id}`} className="sr-only">
              {variant.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutToggle;
