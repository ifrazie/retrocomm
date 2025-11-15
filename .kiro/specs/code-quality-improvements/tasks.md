# Implementation Plan

- [x] 1. Create utility functions and helper modules





  - Create ID generator utility for unique message identifiers
  - Create environment-aware logger utility
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3_

- [x] 1.1 Implement ID generator utility


  - Create `src/utils/generateId.js` file
  - Implement `generateMessageId()` function using timestamp and random string
  - Export function for use in App component
  - _Requirements: 1.1, 1.4_

- [x] 1.2 Implement logger utility


  - Create `src/utils/logger.js` file
  - Implement environment-aware logger object with error, warn, info, log methods
  - Check `process.env.NODE_ENV` to determine if logging should occur
  - Export logger object for use throughout application
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Update message data structure with unique IDs





  - Add unique IDs to EXAMPLE_MESSAGES constant
  - Update message creation in handleSendMessage to include ID
  - Update bot message creation in handleChatbotResponse to include ID
  - Update message rendering to use msg.id as React key
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2.1 Add IDs to existing example messages


  - Import generateMessageId utility in App.jsx
  - Update EXAMPLE_MESSAGES array to include id field for each message
  - Ensure each example message has a unique ID
  - _Requirements: 1.1, 1.5_

- [x] 2.2 Update handleSendMessage to generate IDs


  - Add id field to newMessage object using generateMessageId()
  - Verify message object includes all required fields
  - _Requirements: 1.1, 1.2_

- [x] 2.3 Update handleChatbotResponse to generate IDs


  - Add id field to botMessage object using generateMessageId()
  - Add id field to errorMessage object using generateMessageId()
  - _Requirements: 1.1, 1.2_

- [x] 2.4 Update message rendering to use unique keys


  - Replace `key={idx}` with `key={msg.id}` in pager view message map
  - Replace `key={idx}` with `key={msg.id}` in fax view message map
  - _Requirements: 1.2, 1.3_

- [x] 3. Replace console statements with logger utility





  - Import logger utility in App.jsx
  - Replace console.error calls with logger.error
  - Verify error handling logic remains intact
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3.1 Update error logging in handleChatbotResponse


  - Replace `console.error('Chatbot error:', error)` with `logger.error('Chatbot error:', error)`
  - Test error handling in both development and production modes
  - _Requirements: 2.1, 2.4_


- [x] 3.2 Update error logging in handleCopyWebhookUrl

  - Replace `console.error('Failed to copy to clipboard:', error)` with `logger.error('Failed to copy to clipboard:', error)`
  - Verify clipboard error handling works correctly
  - _Requirements: 2.1, 2.5_

- [x] 4. Extract inline styles to CSS classes




  - Add new CSS classes to App.css
  - Replace inline style props with className props in fax rendering
  - Remove inline style objects from JSX
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Create CSS classes in App.css


  - Add `.fax-message-content` class with margin-top and margin-bottom
  - Add `.fax-status` class with font-size and color
  - Add `.fax-empty-state` class with text-align, padding, and color
  - _Requirements: 3.3, 3.4_

- [x] 4.2 Replace inline styles in fax message rendering


  - Replace `style={{marginTop: '15px', marginBottom: '15px'}}` with `className="fax-message-content"`
  - Replace `style={{fontSize: '10px', color: '#666'}}` with `className="fax-status"`
  - Replace `style={{textAlign: 'center', padding: '40px', color: '#999'}}` with `className="fax-empty-state"`
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 5. Fix message numbering calculation





  - Update pager view message number calculation
  - Calculate correct message number based on position in full array
  - Test with various message counts
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.1 Implement correct message numbering logic


  - Calculate `startIndex` as `Math.max(0, messages.length - 5)` before mapping
  - Update message number calculation to `startIndex + idx + 1`
  - Replace existing calculation `messages.length - 5 + idx + 1` with new logic
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 5.2 Test message numbering with edge cases


  - Test with 0 messages (should show "NO MESSAGES")
  - Test with 1-4 messages (should show correct sequential numbering)
  - Test with exactly 5 messages (should show numbers 1-5)
  - Test with 10+ messages (should show last 5 with correct numbers)
  - _Requirements: 4.2, 4.3_

- [x] 6. Add ARIA labels to all buttons




  - Add aria-label attributes to pager mode buttons
  - Add aria-label attributes to fax mode buttons
  - Add aria-label attributes to mode switcher buttons
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6.1 Add ARIA labels to pager mode buttons


  - Add `aria-label="Scroll to top"` to UP button
  - Add `aria-label="Switch to fax mode"` to FAX button
  - Add `aria-label="Scroll to bottom"` to DOWN button
  - Add `aria-label="Clear all messages"` to CLEAR button
  - Add `aria-label="Open settings menu"` to MENU button
  - Add `aria-label="Mark messages as read"` to READ button
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6.2 Add ARIA labels to fax mode buttons


  - Add `aria-label="Switch to pager mode"` to PAGER button
  - Add `aria-label="Clear all messages"` to CLEAR button
  - Add `aria-label="Open settings menu"` to MENU button
  - Add `aria-label="Mark messages as read"` to READ button
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6.3 Add ARIA labels to mode switcher buttons


  - Add `aria-label="Switch to pager mode"` to Pager Mode button
  - Add `aria-label="Switch to fax mode"` to Fax Mode button
  - _Requirements: 5.2, 5.6_

- [x] 7. Implement toast notification system




  - Create Toast component with auto-dismiss functionality
  - Create toast styling with retro aesthetic
  - Add toast state management to App.jsx
  - Replace alert() with toast notification
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7.1 Create Toast component


  - Create `src/components/Toast.jsx` file
  - Implement Toast component with message, type, duration, and onClose props
  - Add useEffect hook for auto-dismiss timer
  - Implement getIcon helper function for type-based icons
  - Export Toast component
  - _Requirements: 6.2, 6.4_

- [x] 7.2 Create toast styling


  - Create `src/styles/toast.css` file
  - Add `.toast` base class with retro styling (green border, monospace font)
  - Add `.toast-error`, `.toast-success`, `.toast-warning` variant classes
  - Add `@keyframes slideIn` animation for toast entrance
  - Position toast fixed at bottom-right with appropriate z-index
  - _Requirements: 6.3, 6.6_

- [x] 7.3 Add toast state management to App.jsx


  - Import Toast component and toast.css
  - Add `toast` state using useState (initially null)
  - Implement `showToast(message, type, duration)` function
  - Implement `hideToast()` function
  - Render Toast component conditionally when toast state is not null
  - _Requirements: 6.2, 6.3_

- [x] 7.4 Replace alert with toast notification


  - Update handleCopyWebhookUrl error handling
  - Replace `alert('Failed to copy URL. Please copy manually.')` with `showToast('Failed to copy URL. Please copy manually.', 'error')`
  - Test clipboard failure scenario
  - _Requirements: 6.1, 6.5_

- [x] 8. Write unit tests for new utilities




  - Write tests for ID generator utility
  - Write tests for logger utility
  - Write tests for Toast component
  - _Requirements: All_

- [x] 8.1 Write ID generator tests


  - Test that generateMessageId returns a string
  - Test that IDs are unique across multiple calls
  - Test that IDs follow expected format (msg_timestamp_random)
  - _Requirements: 1.1, 1.4_

- [x] 8.2 Write logger utility tests


  - Test that logger.error logs in development mode
  - Test that logger.error suppresses in production mode
  - Test all logger methods (error, warn, info, log)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 8.3 Write Toast component tests


  - Test that Toast renders with correct message and type
  - Test that Toast auto-dismisses after specified duration
  - Test that Toast calls onClose callback
  - Test that correct icon displays for each type
  - _Requirements: 6.2, 6.4_

- [x] 9. Perform integration and accessibility testing




  - Test message creation flow with unique IDs
  - Test error handling with logger in different environments
  - Test toast notifications in user workflows
  - Test accessibility with screen readers
  - _Requirements: All_


- [x] 9.1 Test message flow integration

  - Verify new messages receive unique IDs
  - Verify no React console warnings about duplicate keys
  - Verify message rendering works correctly with IDs
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9.2 Test error handling integration


  - Verify errors are logged in development mode
  - Verify errors are suppressed in production build
  - Verify toast appears on clipboard failure
  - _Requirements: 2.1, 2.4, 6.1_

- [x] 9.3 Test accessibility with screen readers


  - Test with NVDA or JAWS on Windows (or VoiceOver on macOS)
  - Verify all button ARIA labels are announced correctly
  - Verify keyboard navigation works properly
  - Verify toast notifications are accessible
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
