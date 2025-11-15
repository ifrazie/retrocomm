# Design Document - Phase 2: Performance & Advanced Code Quality

## Overview

This design document outlines the technical approach for implementing advanced performance optimizations and code quality improvements to the Retro Messenger application. Building on Phase 1 improvements, this phase focuses on React performance patterns, memory management, accessibility enhancements, and eliminating remaining anti-patterns.

## Architecture

### High-Level Approach

The improvements will be implemented as targeted optimizations to existing components, focusing on:
- Reducing unnecessary re-renders through memoization
- Preventing memory leaks in canvas operations
- Improving code maintainability with named constants
- Enhancing keyboard accessibility
- Standardizing error handling patterns

**Key Principles:**
- Maintain backward compatibility
- Measure performance impact before and after
- Follow React best practices and hooks rules
- Ensure accessibility compliance (WCAG 2.1 AA)
- Keep bundle size impact minimal

## Components and Interfaces

### 1. Optimized Callback Functions (App.jsx)

**Problem:** Inline arrow functions in JSX create new function instances on every render, causing child components to re-render unnecessarily.

**Solution:** Extract callbacks to `useCallback` hooks with proper dependencies.

**Implementation:**

```javascript
// Before (creates new function on every render)
<button onClick={() => setMode('pager')}>Pager Mode</button>
<input onChange={(e) => setInputMessage(e.target.value)} />

// After (stable function reference)
const handleModeChangeToPager = useCallback(() => {
  setMode('pager');
}, []);

const handleModeChangeToFax = useCallback(() => {
  setMode('fax');
}, []);

const handleInputChange = useCallback((e) => {
  setInputMessage(e.target.value);
}, []);

const handleKeyPress = useCallback((e) => {
  if (e.key === 'Enter') {
    handleSendMessage();
  }
}, [handleSendMessage]);

<button onClick={handleModeChangeToPager}>Pager Mode</button>
<input onChange={handleInputChange} onKeyPress={handleKeyPress} />
```

**Functions to Memoize:**
- `scrollToBottom` - Used in useEffect
- Mode switching callbacks
- Input change handlers
- Button click handlers
- Modal open/close handlers

**Dependencies Analysis:**
- Mode callbacks: No dependencies (setMode is stable)
- Input handlers: No dependencies (setInputMessage is stable)
- Message handlers: Depend on current messages state
- Modal handlers: Depend on modal state setters (stable)

### 2. Memoized Context Values

**Problem:** Context provider values are recreated on every render, causing all consumers to re-render even when the actual data hasn't changed.

**Solution:** Wrap context value objects in `useMemo` with appropriate dependencies.

**MessageContext Implementation:**

```javascript
// Before
const value = {
  messages: state.messages,
  addMessage,
  clearHistory,
  setMessages
};

// After
const value = useMemo(() => ({
  messages: state.messages,
  addMessage,
  clearHistory,
  setMessages
}), [state.messages, addMessage, clearHistory, setMessages]);
```

**ConfigContext Implementation:**

```javascript
// Before
const value = {
  webhooks,
  preferences,
  isLoaded,
  setWebhooks,
  setPreferences,
  // ... other functions
};

// After
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
```

**Note:** Function references from useState setters are stable and don't need to be in dependencies, but we include them for clarity.

### 3. Memoized Expensive Computations

**Problem:** Message slicing and filtering operations run on every render, even when messages haven't changed.

**Solution:** Use `useMemo` to cache computed values.

**App.jsx Optimizations:**

```javascript
// Memoize recent messages for pager view
const recentPagerMessages = useMemo(() => {
  return messages.slice(-5);
}, [messages]);

// Memoize message numbering calculation
const messageNumberingInfo = useMemo(() => {
  const startIndex = Math.max(0, messages.length - 5);
  return { startIndex, total: messages.length };
}, [messages.length]);

// Usage in render
{recentPagerMessages.map((msg, idx) => (
  <div key={msg.id}>
    MSG #{messageNumberingInfo.startIndex + idx + 1}
    {/* ... */}
  </div>
))}
```

**PagerInterface.jsx Optimizations:**

```javascript
// Memoize displayed messages (last 50)
const displayedMessages = useMemo(() => {
  return messages.slice(-50);
}, [messages]);

// Usage in render
{displayedMessages.map((message) => (
  <MessageItem key={message.id} message={message} />
))}
```

### 4. Canvas Memory Management

**Problem:** Canvas data URLs (blob: URLs) are created but never revoked, causing memory leaks over time.

**Solution:** Track blob URLs and revoke them when no longer needed.

**FaxInterface.jsx Implementation:**

```javascript
// Track blob URLs for cleanup
const blobUrlsRef = useRef(new Set());

// Modified renderNewFax function
const renderNewFax = async (message) => {
  // ... existing rendering code ...
  
  const dataUrl = await renderFaxWithAnimation(/* ... */);
  
  // Track blob URLs for cleanup
  if (dataUrl.startsWith('blob:')) {
    blobUrlsRef.current.add(dataUrl);
  }
  
  // ... rest of function ...
};

// Cleanup effect
useEffect(() => {
  return () => {
    // Revoke all blob URLs on unmount
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  };
}, []);

// Cleanup when archive is trimmed
useEffect(() => {
  if (faxArchive.length > 100) {
    // Get URLs that were removed
    const removedFaxes = faxArchive.slice(0, faxArchive.length - 100);
    removedFaxes.forEach(fax => {
      if (fax.imageDataUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fax.imageDataUrl);
        blobUrlsRef.current.delete(fax.imageDataUrl);
      }
    });
  }
}, [faxArchive]);
```

**Memory Impact:**
- Each fax image: ~50-200 KB
- 100 faxes without cleanup: 5-20 MB memory leak
- With cleanup: Memory usage stays constant

### 5. Named Constants for Magic Numbers

**Problem:** Hard-coded numbers throughout the codebase make it difficult to understand intent and maintain consistency.

**Solution:** Extract to named constants with descriptive names and comments.

**Constants File (src/utils/constants.js):**

```javascript
/**
 * Application-wide constants
 */

// Message Display Limits
export const MAX_PAGER_MESSAGES = 5;        // Number of messages shown in pager view
export const MAX_DISPLAY_MESSAGES = 50;     // Number of messages shown in interface lists
export const MAX_STORED_MESSAGES = 100;     // Maximum messages kept in memory/storage
export const MAX_FAX_ARCHIVE = 100;         // Maximum fax documents in archive

// LLM Configuration
export const MAX_LLM_TOKENS = 150;          // Maximum tokens for LLM responses (keeps responses concise)
export const LLM_TEMPERATURE = 0.7;         // LLM temperature for response generation
export const MAX_CONVERSATION_HISTORY = 20; // Maximum messages in LLM conversation history

// UI Timing
export const WEBHOOK_DELAY_MS = 1500;       // Simulated webhook transmission delay
export const TOAST_DURATION_MS = 3000;      // Default toast notification duration
export const COPY_FEEDBACK_DURATION_MS = 2000; // Duration to show "Copied" feedback

// Retry Configuration
export const DEFAULT_RETRY_ATTEMPTS = 3;    // Default number of retry attempts
export const DEFAULT_RETRY_BASE_DELAY = 1000; // Base delay for exponential backoff (ms)

// Message Constraints
export const MAX_PAGER_MESSAGE_LENGTH = 240; // Maximum characters for pager messages

// Animation Timing
export const FAX_ANIMATION_DURATION_MS = 2500; // Duration of fax rendering animation
```

**Usage Example:**

```javascript
import { MAX_PAGER_MESSAGES, MAX_STORED_MESSAGES } from './utils/constants';

// In App.jsx
const recentMessages = useMemo(() => {
  return messages.slice(-MAX_PAGER_MESSAGES);
}, [messages]);

// In MessageContext.jsx
const limitedMessages = newMessages.slice(-MAX_STORED_MESSAGES);
```

### 6. Modal Keyboard Accessibility

**Problem:** Settings modal doesn't respond to Escape key and doesn't trap focus for keyboard users.

**Solution:** Implement keyboard event handling and focus management.

**App.jsx Modal Enhancement:**

```javascript
// Ref for the element that opened the modal
const modalTriggerRef = useRef(null);

// Handle Escape key
useEffect(() => {
  if (!showSettings) return;
  
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      setShowSettings(false);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [showSettings]);

// Focus management
useEffect(() => {
  if (showSettings) {
    // Store the element that opened the modal
    modalTriggerRef.current = document.activeElement;
    
    // Focus the first focusable element in the modal
    setTimeout(() => {
      const modal = document.querySelector('.settings-modal');
      const firstFocusable = modal?.querySelector('button, input, select, textarea');
      firstFocusable?.focus();
    }, 0);
  } else if (modalTriggerRef.current) {
    // Return focus when modal closes
    modalTriggerRef.current.focus();
  }
}, [showSettings]);

// Add ARIA attributes to modal
<div 
  className="settings-modal-overlay" 
  onClick={() => setShowSettings(false)}
  role="dialog"
  aria-modal="true"
  aria-labelledby="settings-modal-title"
>
  <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
    <div className="settings-header">
      <h2 id="settings-modal-title">⚙ WEBHOOK CONFIGURATION</h2>
      {/* ... */}
    </div>
  </div>
</div>
```

**Focus Trap Implementation (Optional Enhancement):**

For a complete focus trap, we could use a library like `focus-trap-react` or implement manually:

```javascript
const handleTabKey = (e) => {
  const modal = document.querySelector('.settings-modal');
  const focusableElements = modal.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
};
```

### 7. Production Console Cleanup

**Problem:** Console statements remain in multiple files, exposing debugging information in production.

**Solution:** Replace all console statements with logger utility or environment checks.

**Files to Update:**

1. **PagerInterface.jsx** (line 107):
```javascript
// Before
console.log(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);

// After
import { logger } from '../utils/logger';
logger.info(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
```

2. **FaxInterface.jsx** (lines 107, 186):
```javascript
// Before
console.log(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
console.error('Error rendering fax:', error);

// After
import { logger } from '../utils/logger';
logger.info(`Retry attempt ${attempt} after ${delay}ms due to:`, error.message);
logger.error('Error rendering fax:', error);
```

3. **retry.js** (lines 35, 40, 45):
```javascript
// Before
console.log(`Operation succeeded on attempt ${attempt}`);
console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
console.error(`All ${maxAttempts} attempts failed. Last error:`, error);
console.log(`Retrying in ${delay}ms...`);

// After
import { logger } from './logger';
logger.info(`Operation succeeded on attempt ${attempt}`);
logger.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);
logger.error(`All ${maxAttempts} attempts failed. Last error:`, error);
logger.info(`Retrying in ${delay}ms...`);
```

4. **LLMChatbotService.js** (extensive logging):
```javascript
// Wrap all console statements in environment checks
const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  console.log('🔌 Attempting to connect to LM Studio...');
  // ... other logs
}
```

### 8. Memoized Pure Components

**Problem:** Pure components re-render even when props haven't changed.

**Solution:** Wrap in `React.memo` with default shallow comparison.

**Toast.jsx:**

```javascript
// Before
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  // ... component code
};

export default Toast;

// After
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  // ... component code
};

export default React.memo(Toast);
```

**ModeToggle.jsx:**

```javascript
// Before
const ModeToggle = () => {
  // ... component code
};

export default ModeToggle;

// After
const ModeToggle = () => {
  // ... component code
};

export default React.memo(ModeToggle);
```

**Note:** MessageItem and FaxThumbnail are already memoized ✓

### 9. Standardized Error Handling

**Problem:** Inconsistent error handling patterns across async functions.

**Solution:** Establish standard error handling pattern.

**Standard Pattern:**

```javascript
const handleAsyncOperation = async () => {
  try {
    // Attempt operation
    const result = await someAsyncFunction();
    
    // Success handling
    showToast('Operation successful', 'success');
    return result;
  } catch (error) {
    // Log error (development only)
    logger.error('Operation failed:', error);
    
    // User-friendly error message
    showToast(
      `Operation failed: ${error.message || 'Unknown error'}`,
      'error'
    );
    
    // Optionally re-throw for caller to handle
    // throw error;
  }
};
```

**Apply to:**
- `handleChatbotResponse` in App.jsx
- `_sendMessage` in PagerInterface.jsx
- `_sendMessage` in FaxInterface.jsx
- `renderNewFax` in FaxInterface.jsx
- `handleCopyWebhookUrl` in App.jsx

### 10. Optimized State Updates

**Problem:** Multiple sequential setState calls cause multiple re-renders.

**Solution:** Batch related state updates or use a single state object.

**App.jsx handleSendMessage Optimization:**

```javascript
// Before (4 separate state updates = 4 re-renders)
setMessages([...messages, newMessage]);
setInputMessage('');
setWebhookStatus('sending');
setHasNewMessage(true);

// After Option 1: React 18 automatic batching (already works)
// React 18 automatically batches these in event handlers
// No change needed, but we can make it explicit

// After Option 2: Single state object (more complex refactor)
const [messageState, setMessageState] = useState({
  messages: EXAMPLE_MESSAGES,
  inputMessage: '',
  webhookStatus: 'connected',
  hasNewMessage: false
});

setMessageState(prev => ({
  ...prev,
  messages: [...prev.messages, newMessage],
  inputMessage: '',
  webhookStatus: 'sending',
  hasNewMessage: true
}));
```

**Recommendation:** Since React 18 automatically batches updates in event handlers, we can keep the current approach but add a comment explaining the batching behavior.

## Data Models

### Constants Module

```typescript
// src/utils/constants.js
export interface AppConstants {
  // Message limits
  MAX_PAGER_MESSAGES: number;
  MAX_DISPLAY_MESSAGES: number;
  MAX_STORED_MESSAGES: number;
  MAX_FAX_ARCHIVE: number;
  
  // LLM config
  MAX_LLM_TOKENS: number;
  LLM_TEMPERATURE: number;
  MAX_CONVERSATION_HISTORY: number;
  
  // Timing
  WEBHOOK_DELAY_MS: number;
  TOAST_DURATION_MS: number;
  COPY_FEEDBACK_DURATION_MS: number;
  FAX_ANIMATION_DURATION_MS: number;
  
  // Retry config
  DEFAULT_RETRY_ATTEMPTS: number;
  DEFAULT_RETRY_BASE_DELAY: number;
  
  // Constraints
  MAX_PAGER_MESSAGE_LENGTH: number;
}
```

## Error Handling

### Standardized Error Pattern

All async operations follow this pattern:
1. Try the operation
2. Log errors in development (logger.error)
3. Show user-friendly toast notification
4. Optionally re-throw for caller handling
5. Maintain application state consistency

### Memory Leak Prevention

- Canvas blob URLs are tracked and revoked
- Event listeners are cleaned up in useEffect returns
- Timers are cleared on component unmount
- Refs are cleared when no longer needed

## Testing Strategy

### Performance Testing

1. **Render Count Measurement:**
   - Use React DevTools Profiler
   - Measure renders before and after optimizations
   - Target: 50% reduction in unnecessary re-renders

2. **Memory Profiling:**
   - Use Chrome DevTools Memory Profiler
   - Create 100+ fax messages
   - Verify memory doesn't grow unbounded
   - Target: Stable memory usage after cleanup

3. **Bundle Size Analysis:**
   - Run `npm run build` before and after
   - Verify no significant size increase
   - Target: < 1 KB additional bundle size

### Unit Testing

1. **Hook Tests:**
   - Test useCallback dependencies
   - Test useMemo recalculation
   - Test cleanup functions

2. **Component Tests:**
   - Test React.memo prevents re-renders
   - Test keyboard event handling
   - Test focus management

3. **Integration Tests:**
   - Test error handling flows
   - Test state update batching
   - Test memory cleanup

### Accessibility Testing

1. **Keyboard Navigation:**
   - Tab through modal
   - Press Escape to close
   - Verify focus trap

2. **Screen Reader:**
   - Test with NVDA/JAWS/VoiceOver
   - Verify modal announcements
   - Verify ARIA attributes

## Performance Considerations

### Expected Improvements

1. **Re-render Reduction:**
   - Context consumers: 70% fewer re-renders
   - Child components: 50% fewer re-renders
   - Input handlers: Stable references

2. **Memory Usage:**
   - Fax interface: Constant memory vs. growing
   - Overall: 10-20 MB savings over extended use

3. **Computation:**
   - Message slicing: Cached vs. recalculated
   - Numbering: O(1) vs. O(n) on each render

### Bundle Size Impact

- Constants file: ~500 bytes
- Additional hooks: ~200 bytes
- React.memo wrappers: ~100 bytes per component
- **Total: < 1 KB**

## Migration Strategy

### Implementation Order

1. **Low Risk (Do First):**
   - Add constants file
   - Replace console statements
   - Add React.memo to pure components

2. **Medium Risk:**
   - Add useCallback to callbacks
   - Add useMemo to computations
   - Add useMemo to context values

3. **Higher Risk (Test Thoroughly):**
   - Implement canvas cleanup
   - Add modal keyboard handling
   - Refactor state updates

### Rollback Plan

Each optimization is independent and can be rolled back individually if issues arise. Git commits should be atomic per optimization.

## Future Enhancements

1. **Advanced Memoization:**
   - Custom comparison functions for React.memo
   - Selective context subscriptions
   - Virtual scrolling for large message lists

2. **Performance Monitoring:**
   - Add performance marks/measures
   - Track render times in production
   - Alert on performance regressions

3. **Code Splitting:**
   - Lazy load LLM SDK
   - Route-based splitting (if routing added)
   - Component-level code splitting

