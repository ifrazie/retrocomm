import React, { useEffect, useRef } from 'react';
import './LayoutContainer.css';

/**
 * LayoutContainer Component
 * Wrapper component that applies experimental layout variants
 * Provides flexible CSS-driven layout system with multiple variants
 * Manages layout transition animations by adding/removing .layout-transitioning class
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Layout variant ('default' | 'compact' | 'experimental')
 * @param {React.ReactNode} props.children - Child components to render
 */
const LayoutContainer = ({ variant = 'default', children }) => {
  const previousVariant = useRef(variant);
  const containerRef = useRef(null);

  useEffect(() => {
    // Only trigger transition if variant actually changed
    if (previousVariant.current !== variant) {
      // Add transitioning class to body
      document.body.classList.add('layout-transitioning');

      // Announce layout change to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Layout changed to ${variant} mode`;
      document.body.appendChild(announcement);

      // Remove transitioning class after animation completes (300ms)
      const timeoutId = setTimeout(() => {
        document.body.classList.remove('layout-transitioning');
        document.body.removeChild(announcement);
      }, 300);

      // Update previous variant
      previousVariant.current = variant;

      // Cleanup timeout on unmount or variant change
      return () => {
        clearTimeout(timeoutId);
        document.body.classList.remove('layout-transitioning');
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      };
    }
  }, [variant]);

  return (
    <div 
      ref={containerRef}
      className={`LayoutContainer LayoutContainer--${variant}`}
      role="main"
      aria-label={`${variant} layout container`}
    >
      {children}
    </div>
  );
};

export default LayoutContainer;
