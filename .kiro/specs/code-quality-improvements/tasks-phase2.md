# Implementation Plan - Phase 2: Performance & Advanced Code Quality

- [x] 1. Create constants file and replace magic numbers


  - Create centralized constants file with descriptive names
  - Replace hard-coded numbers throughout the codebase
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_



- [ ] 1.1 Create constants file
  - Create `src/utils/constants.js` file
  - Define MAX_PAGER_MESSAGES = 5
  - Define MAX_DISPLAY_MESSAGES = 50
  - Define MAX_STORED_MESSAGES = 100
  - Define MAX_FAX_ARCHIVE = 100
  - Define MAX_LLM_TOKENS = 150
  - Define LLM_TEMPERATURE = 0.7
  - Define MAX_CONVERSATION_HISTORY = 20
  - Define WEBHOOK_DELAY_MS = 1500
  - Define TOAST_DURATION_MS = 3000
  - Define COPY_FEEDBACK_DURATION_MS = 2000
  - Define FAX_ANIMATION_DURATION_MS = 2500
  - Define DEFAULT_RETRY_ATTEMPTS = 3
  - Define DEFAULT_RETRY_BASE_DELAY = 1000
  - Define MAX_PAGER_MESSAGE_LENGTH = 240
  - Add JSDoc comments explaining each constant


  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 1.2 Replace magic numbers in App.jsx
  - Import constants from utils/constants
  - Replace `messages.slice(-5)` with `messages.slice(-MAX_PAGER_MESSAGES)`
  - Replace `1500` timeout with `WEBHOOK_DELAY_MS`


  - Replace `2000` timeout with `COPY_FEEDBACK_DURATION_MS`
  - Replace `3000` toast duration with `TOAST_DURATION_MS`
  - _Requirements: 5.1, 5.4, 5.6_



- [ ] 1.3 Replace magic numbers in PagerInterface.jsx
  - Import constants from utils/constants
  - Replace `messages.slice(-50)` with `messages.slice(-MAX_DISPLAY_MESSAGES)`
  - Replace `240` maxLength with `MAX_PAGER_MESSAGE_LENGTH`


  - _Requirements: 5.2, 5.6_

- [ ] 1.4 Replace magic numbers in FaxInterface.jsx
  - Import constants from utils/constants


  - Replace `2500` animation duration with `FAX_ANIMATION_DURATION_MS`
  - Replace `.slice(-100)` with `.slice(-MAX_FAX_ARCHIVE)`
  - _Requirements: 5.3, 5.6_

- [x] 1.5 Replace magic numbers in MessageContext.jsx

  - Import constants from utils/constants
  - Replace `.slice(-100)` with `.slice(-MAX_STORED_MESSAGES)`
  - Replace `100` in getMessageHistory with `MAX_STORED_MESSAGES`
  - _Requirements: 5.3, 5.6_



- [ ] 1.6 Replace magic numbers in LLMChatbotService.js
  - Import constants from utils/constants
  - Replace `maxTokens: 150` with `maxTokens: MAX_LLM_TOKENS`
  - Replace `temperature: 0.7` with `temperature: LLM_TEMPERATURE`
  - Replace `21` and `20` with `MAX_CONVERSATION_HISTORY + 1` and `MAX_CONVERSATION_HISTORY`
  - _Requirements: 5.4, 5.6_

- [ ] 1.7 Replace magic numbers in retry.js
  - Import constants from utils/constants

  - Replace default `maxAttempts = 3` with `maxAttempts = DEFAULT_RETRY_ATTEMPTS`
  - Replace default `baseDelay = 1000` with `baseDelay = DEFAULT_RETRY_BASE_DELAY`

  - _Requirements: 5.6_

- [x] 2. Replace all console statements with logger utility

  - Update all files to use logger instead of console
  - Ensure production builds have no console output
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 2.1 Update PagerInterface.jsx console statements
  - Import logger from utils/logger
  - Replace `console.log` on line 107 with `logger.info`
  - Replace `console.error` statements with `logger.error`
  - _Requirements: 7.3_

- [ ] 2.2 Update FaxInterface.jsx console statements
  - Import logger from utils/logger



  - Replace `console.log` on line 107 with `logger.info`
  - Replace `console.error` on line 186 with `logger.error`
  - Replace other console.error statements with `logger.error`
  - _Requirements: 7.4_




- [ ] 2.3 Update retry.js console statements
  - Import logger from utils/logger
  - Replace `console.log` with `logger.info`
  - Replace `console.warn` with `logger.warn`
  - Replace `console.error` with `logger.error`
  - _Requirements: 7.5_

- [ ] 2.4 Update LLMChatbotService.js console statements
  - Add environment check: `const isDevelopment = import.meta.env.DEV`
  - Wrap all console.log statements in `if (isDevelopment)` blocks
  - Wrap all console.error statements in `if (isDevelopment)` blocks
  - Keep helpful error messages but only in development
  - _Requirements: 7.6_

- [ ] 2.5 Verify production build has no console output
  - Run `npm run build`


  - Test production build locally
  - Verify no console statements appear in browser console
  - _Requirements: 7.1, 7.2_



- [ ] 3. Add React.memo to pure components
  - Wrap pure components in React.memo to prevent unnecessary re-renders
  - Test that components still function correctly
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_



- [ ] 3.1 Memoize Toast component
  - Import React at top of Toast.jsx
  - Wrap Toast component export with `React.memo(Toast)`
  - Test that Toast still auto-dismisses correctly
  - Test that Toast re-renders when props change
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 3.2 Memoize ModeToggle component
  - Import React at top of ModeToggle.jsx
  - Wrap ModeToggle component export with `React.memo(ModeToggle)`


  - Test that mode switching still works
  - Test that active state updates correctly
  - _Requirements: 8.2, 8.3, 8.4, 8.5_


- [ ] 4. Optimize App.jsx with useCallback hooks
  - Extract inline functions to useCallback hooks
  - Ensure proper dependency arrays
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [ ] 4.1 Memoize scrollToBottom function
  - Wrap scrollToBottom in useCallback with empty dependencies
  - Update useEffect dependency array to include memoized function
  - _Requirements: 1.1, 1.4_


- [ ] 4.2 Memoize mode switching callbacks
  - Create `handleModeChangeToPager` with useCallback
  - Create `handleModeChangeToFax` with useCallback
  - Replace inline arrow functions in mode switcher buttons
  - Replace inline arrow functions in pager/fax control buttons

  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 4.3 Memoize input change handlers
  - Create `handleInputChange` with useCallback

  - Create `handleKeyPress` with useCallback (depends on handleSendMessage)
  - Replace inline arrow functions in input elements
  - _Requirements: 1.1, 1.2, 1.4_


- [ ] 4.4 Memoize button click handlers
  - Create `handleClearMessages` callback (already exists, verify it's memoized)
  - Create `handleOpenSettings` with useCallback


  - Create `handleCloseSettings` with useCallback
  - Create `handleMarkAsRead` with useCallback
  - Replace inline arrow functions in button elements
  - _Requirements: 1.1, 1.2, 1.3_



- [x] 4.5 Memoize scroll handlers

  - Create `handleScrollToTop` with useCallback
  - Create `handleScrollToBottom` with useCallback
  - Replace inline arrow functions in scroll buttons



  - _Requirements: 1.1, 1.2_


- [ ] 5. Add useMemo to context providers
  - Wrap context value objects in useMemo


  - Prevent unnecessary re-renders of context consumers
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5.1 Memoize MessageContext value


  - Import useMemo in MessageContext.jsx
  - Wrap value object in useMemo
  - Add dependencies: [state.messages, addMessage, clearHistory, setMessages]
  - Test that context consumers don't re-render unnecessarily


  - _Requirements: 2.1, 2.3, 2.4_

- [x] 5.2 Memoize ConfigContext value

  - Import useMemo in ConfigContext.jsx

  - Wrap value object in useMemo
  - Add all state and function dependencies
  - Test that context consumers don't re-render unnecessarily
  - _Requirements: 2.2, 2.3, 2.4, 2.5_






- [ ] 6. Add useMemo for expensive computations
  - Memoize message slicing and calculations
  - Prevent recalculation on every render


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.1 Memoize recent pager messages in App.jsx
  - Import useMemo
  - Create `recentPagerMessages` with useMemo

  - Memoize `messages.slice(-MAX_PAGER_MESSAGES)`
  - Update render to use memoized value
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 6.2 Memoize message numbering info in App.jsx
  - Create `messageNumberingInfo` with useMemo


  - Calculate startIndex and total in memoized value
  - Update render to use memoized values
  - _Requirements: 3.2, 3.3, 3.5_

- [x] 6.3 Memoize displayed messages in PagerInterface.jsx

  - Import useMemo
  - Create `displayedMessages` with useMemo
  - Memoize `messages.slice(-MAX_DISPLAY_MESSAGES)`
  - Update render to use memoized value
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 7. Implement canvas memory management
  - Track and revoke blob URLs to prevent memory leaks
  - Clean up on component unmount and archive trimming
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7.1 Add blob URL tracking in FaxInterface.jsx
  - Import useRef
  - Create `blobUrlsRef` with useRef(new Set())
  - Track blob URLs when created in renderNewFax
  - _Requirements: 4.1_

- [ ] 7.2 Add cleanup on unmount
  - Add useEffect with empty dependency array
  - Return cleanup function that revokes all blob URLs
  - Clear the blobUrlsRef Set
  - _Requirements: 4.2, 4.4_

- [ ] 7.3 Add cleanup when archive is trimmed
  - Add useEffect with [faxArchive] dependency
  - Check if faxArchive.length > MAX_FAX_ARCHIVE
  - Revoke URLs for removed fax documents
  - Remove URLs from blobUrlsRef Set
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 7.4 Test memory management
  - Create 100+ fax messages
  - Use Chrome DevTools Memory Profiler
  - Verify memory doesn't grow unbounded
  - Verify cleanup happens on unmount
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Implement modal keyboard accessibility
  - Add Escape key handling
  - Implement focus management
  - Add ARIA attributes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8.1 Add Escape key handler
  - Create useEffect that runs when showSettings is true
  - Add keydown event listener for Escape key
  - Close modal when Escape is pressed
  - Clean up event listener on unmount
  - _Requirements: 6.1, 6.2, 6.6_

- [ ] 8.2 Implement focus management
  - Create modalTriggerRef with useRef
  - Store active element when modal opens
  - Focus first focusable element in modal
  - Return focus to trigger when modal closes
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 8.3 Add ARIA attributes to modal
  - Add `role="dialog"` to modal overlay
  - Add `aria-modal="true"` to modal overlay
  - Add `aria-labelledby="settings-modal-title"` to modal overlay
  - Add `id="settings-modal-title"` to modal heading
  - _Requirements: 6.3, 6.6_

- [ ] 8.4 Test keyboard accessibility
  - Test Escape key closes modal
  - Test focus moves to modal on open
  - Test focus returns to trigger on close
  - Test with screen reader (NVDA/JAWS/VoiceOver)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Standardize error handling patterns
  - Ensure consistent error handling across async functions
  - Use logger for errors and toast for user feedback
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9.1 Review and document error handling pattern
  - Document standard pattern in design doc
  - Create example implementation
  - Identify all async functions needing updates
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 9.2 Standardize error handling in App.jsx
  - Review handleChatbotResponse error handling
  - Review handleCopyWebhookUrl error handling
  - Ensure consistent use of logger and toast
  - Add user-friendly error messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9.3 Standardize error handling in PagerInterface.jsx
  - Review _sendMessage error handling
  - Review _handleSubmit error handling
  - Review _handleRetry error handling
  - Ensure consistent use of logger and toast
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9.4 Standardize error handling in FaxInterface.jsx
  - Review _sendMessage error handling
  - Review _handleSubmit error handling
  - Review _handleRetry error handling
  - Review renderNewFax error handling
  - Ensure consistent use of logger and toast
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 10. Document state update batching
  - Add comments explaining React 18 automatic batching
  - Verify batching behavior in event handlers
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10.1 Add batching comments to App.jsx
  - Add comment above handleSendMessage state updates
  - Explain that React 18 automatically batches these updates
  - Note that this prevents multiple re-renders
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 10.2 Verify batching behavior
  - Use React DevTools Profiler
  - Verify only one render occurs for multiple setState calls
  - Test in both development and production modes
  - _Requirements: 10.4, 10.5_

- [ ] 11. Performance testing and validation
  - Measure performance improvements
  - Verify no regressions
  - Document results
  - _Requirements: All_

- [ ] 11.1 Measure render counts
  - Use React DevTools Profiler
  - Record render counts before optimizations
  - Record render counts after optimizations
  - Calculate percentage improvement
  - Target: 50% reduction in unnecessary re-renders
  - _Requirements: 1.1, 2.1, 3.1, 8.1_

- [ ] 11.2 Measure memory usage
  - Use Chrome DevTools Memory Profiler
  - Create 100+ fax messages
  - Record memory usage before cleanup implementation
  - Record memory usage after cleanup implementation
  - Verify memory stays constant after cleanup
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 11.3 Measure bundle size
  - Run `npm run build` before optimizations
  - Record bundle size
  - Run `npm run build` after optimizations
  - Record new bundle size
  - Verify increase is < 1 KB
  - _Requirements: All_

- [ ] 11.4 Test accessibility
  - Test keyboard navigation through modal
  - Test Escape key functionality
  - Test focus management
  - Test with screen reader (NVDA/JAWS/VoiceOver)
  - Verify ARIA attributes are announced correctly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 11.5 Verify production build
  - Run `npm run build`
  - Test production build locally
  - Verify no console statements in browser console
  - Verify all functionality works correctly
  - Verify performance improvements are maintained
  - _Requirements: 7.1, 7.2_

- [ ] 12. Update documentation
  - Document performance optimizations
  - Update README with new constants
  - Add performance testing guide
  - _Requirements: All_

- [ ] 12.1 Document constants usage
  - Add section to README about constants file
  - Explain purpose of each constant
  - Provide examples of usage
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 12.2 Document performance optimizations
  - Create PERFORMANCE.md document
  - Explain useCallback, useMemo, React.memo usage
  - Document memory management approach
  - Provide before/after metrics
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

- [ ] 12.3 Document accessibility improvements
  - Update README with accessibility features
  - Document keyboard shortcuts
  - Explain ARIA attributes
  - Provide screen reader testing guide
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

