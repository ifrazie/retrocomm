/**
 * Layout Configuration Utilities
 * Provides constants, helpers, and configuration objects for the layout system
 * Centralizes layout variant definitions and custom property values
 */

/**
 * Layout Variant Constants
 * Defines available layout variants for the LayoutContainer component
 */
export const LAYOUT_VARIANTS = {
  DEFAULT: 'default',
  EXPERIMENTAL: 'experimental',
  COMPACT: 'compact'
};

/**
 * Layout Breakpoint Constants
 * Defines responsive breakpoint values in pixels
 */
export const LAYOUT_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
  ULTRA_WIDE: 2560
};

/**
 * Layout Custom Properties Configuration
 * Maps CSS custom property names to their default values
 * These values correspond to the :root CSS variables in LayoutContainer.css
 */
export const LAYOUT_CUSTOM_PROPERTIES = {
  // Spacing
  layoutGap: '1rem',
  layoutPadding: '1rem',
  layoutBorderRadius: '8px',
  
  // Zone Dimensions
  headerHeight: '60px',
  sidebarWidth: '300px',
  inputMinHeight: '60px',
  
  // Transitions
  transitionDuration: '300ms',
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Z-index Layers
  zHeader: 100,
  zSidebar: 90,
  zModal: 1000,
  zToast: 1100
};

/**
 * Layout Variant Configurations
 * Defines grid template areas and columns for each layout variant
 */
export const LAYOUT_VARIANT_CONFIG = {
  [LAYOUT_VARIANTS.DEFAULT]: {
    name: 'Default',
    description: 'Two-column layout with display and controls',
    gridTemplateAreas: `
      "header header"
      "display controls"
      "input input"
    `,
    gridTemplateColumns: '1fr 300px',
    gridTemplateRows: 'var(--header-height) 1fr auto',
    showControls: true
  },
  [LAYOUT_VARIANTS.EXPERIMENTAL]: {
    name: 'Experimental',
    description: 'Split-view layout with sidebar controls',
    gridTemplateAreas: `
      "header header"
      "display controls"
      "input input"
    `,
    gridTemplateColumns: '1fr 300px',
    gridTemplateRows: 'var(--header-height) 1fr auto',
    showControls: true
  },
  [LAYOUT_VARIANTS.COMPACT]: {
    name: 'Compact',
    description: 'Single-column layout with collapsed sidebar',
    gridTemplateAreas: `
      "header"
      "display"
      "input"
    `,
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'var(--header-height) 1fr auto',
    showControls: false
  }
};

/**
 * Responsive Configuration
 * Defines layout adjustments for different screen sizes
 */
export const RESPONSIVE_CONFIG = {
  mobile: {
    maxWidth: LAYOUT_BREAKPOINTS.MOBILE - 1,
    customProperties: {
      layoutGap: '0.5rem',
      layoutPadding: '0.5rem',
      headerHeight: '50px'
    },
    gridTemplateAreas: `
      "header"
      "display"
      "input"
    `,
    gridTemplateColumns: '1fr',
    showControls: false,
    minTouchTargetSize: '44px'
  },
  tablet: {
    minWidth: LAYOUT_BREAKPOINTS.MOBILE,
    maxWidth: LAYOUT_BREAKPOINTS.TABLET - 1,
    customProperties: {
      sidebarWidth: '250px'
    }
  },
  desktop: {
    minWidth: LAYOUT_BREAKPOINTS.DESKTOP,
    customProperties: {
      sidebarWidth: '300px'
    }
  },
  ultraWide: {
    minWidth: LAYOUT_BREAKPOINTS.ULTRA_WIDE,
    maxWidth: '2560px',
    centered: true
  }
};

/**
 * Helper Functions
 */

/**
 * Get layout variant configuration
 * @param {string} variant - Layout variant name
 * @returns {Object} Layout variant configuration object
 */
export const getLayoutVariantConfig = (variant) => {
  return LAYOUT_VARIANT_CONFIG[variant] || LAYOUT_VARIANT_CONFIG[LAYOUT_VARIANTS.DEFAULT];
};

/**
 * Check if a layout variant is valid
 * @param {string} variant - Layout variant name to validate
 * @returns {boolean} True if variant is valid
 */
export const isValidLayoutVariant = (variant) => {
  return Object.values(LAYOUT_VARIANTS).includes(variant);
};

/**
 * Get all available layout variants
 * @returns {Array<string>} Array of layout variant names
 */
export const getAvailableLayoutVariants = () => {
  return Object.values(LAYOUT_VARIANTS);
};

/**
 * Get CSS custom property name from camelCase key
 * @param {string} key - camelCase property key
 * @returns {string} CSS custom property name (e.g., 'layoutGap' -> '--layout-gap')
 */
export const getCSSCustomPropertyName = (key) => {
  // Convert camelCase to kebab-case and add -- prefix
  const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `--${kebabCase}`;
};

/**
 * Apply custom properties to an element
 * @param {HTMLElement} element - Target element
 * @param {Object} properties - Object with custom property values
 */
export const applyCustomProperties = (element, properties) => {
  Object.entries(properties).forEach(([key, value]) => {
    const cssPropertyName = getCSSCustomPropertyName(key);
    element.style.setProperty(cssPropertyName, value);
  });
};

/**
 * Get current breakpoint based on window width
 * @param {number} width - Window width in pixels (defaults to window.innerWidth)
 * @returns {string} Current breakpoint name ('mobile', 'tablet', 'desktop', 'ultraWide')
 */
export const getCurrentBreakpoint = (width = window.innerWidth) => {
  if (width < LAYOUT_BREAKPOINTS.MOBILE) {
    return 'mobile';
  } else if (width < LAYOUT_BREAKPOINTS.TABLET) {
    return 'tablet';
  } else if (width < LAYOUT_BREAKPOINTS.ULTRA_WIDE) {
    return 'desktop';
  } else {
    return 'ultraWide';
  }
};

/**
 * Get responsive configuration for current breakpoint
 * @param {string} breakpoint - Breakpoint name (defaults to current breakpoint)
 * @returns {Object} Responsive configuration object
 */
export const getResponsiveConfig = (breakpoint = getCurrentBreakpoint()) => {
  return RESPONSIVE_CONFIG[breakpoint] || RESPONSIVE_CONFIG.desktop;
};

/**
 * Check if device prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get transition duration based on user preferences
 * @returns {string} Transition duration ('0ms' if reduced motion, default duration otherwise)
 */
export const getTransitionDuration = () => {
  return prefersReducedMotion() ? '0ms' : LAYOUT_CUSTOM_PROPERTIES.transitionDuration;
};

/**
 * Complete Layout Configuration Object
 * Exports all configuration in a single object for convenience
 */
export const LAYOUT_CONFIG = {
  variants: LAYOUT_VARIANTS,
  breakpoints: LAYOUT_BREAKPOINTS,
  customProperties: LAYOUT_CUSTOM_PROPERTIES,
  variantConfig: LAYOUT_VARIANT_CONFIG,
  responsiveConfig: RESPONSIVE_CONFIG
};

export default LAYOUT_CONFIG;
