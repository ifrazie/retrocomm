# Implementation Plan

- [x] 1. Set up project structure and dependencies









  - Initialize React project with Vite
  - Install dependencies: react-router-dom, express, cors, uuid, dompurify
  - Create directory structure: src/components, src/contexts, src/utils, src/styles, server/
  - Configure Vite for proxy to backend during development
  - _Requirements: All_

- [x] 2. Implement core data models and utilities





  - [x] 2.1 Create TypeScript interfaces for Message, WebhookSettings, AppConfig, and ConnectionStatus


    - Define interfaces in src/types/index.ts
    - Export all type definitions
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_
  
  - [x] 2.2 Implement message sanitization utility


    - Create src/utils/sanitize.ts with DOMPurify integration
    - Add function to strip HTML and prevent XSS
    - _Requirements: 6.5_
  
  - [x] 2.3 Implement LocalStorage helper utilities


    - Create src/utils/storage.ts with get/set/remove functions
    - Add functions for config persistence and message history management
    - _Requirements: 4.4, 5.3_
  
  - [x] 2.4 Implement URL validation utility


    - Create src/utils/validation.ts with URL format validation
    - Add webhook URL validation logic
    - _Requirements: 4.3_

- [x] 3. Create message context and state management




  - [x] 3.1 Implement MessageContext with useReducer


    - Create src/contexts/MessageContext.tsx
    - Define actions: ADD_MESSAGE, CLEAR_HISTORY, SET_MESSAGES
    - Implement reducer to manage message queue (max 100 messages)
    - _Requirements: 1.5, 2.5, 5.2_
  
  - [x] 3.2 Implement ConfigContext for webhook settings


    - Create src/contexts/ConfigContext.tsx
    - Manage webhook URLs, auth token, and mode preference
    - Integrate with LocalStorage utilities for persistence
    - _Requirements: 4.4, 5.3, 5.4_

- [x] 4. Build backend webhook service





  - [x] 4.1 Create Express server with basic routing


    - Create server/index.js with Express setup
    - Configure CORS middleware
    - Add body-parser for JSON payloads
    - _Requirements: 3.1, 6.3_
  
  - [x] 4.2 Implement authentication middleware


    - Create server/middleware/auth.js
    - Validate Bearer tokens from Authorization header
    - Return 401 for invalid tokens when auth enabled
    - _Requirements: 6.1, 6.2_
  
  - [x] 4.3 Implement message validation middleware


    - Create server/middleware/validator.js
    - Validate JSON payload structure
    - Sanitize message content
    - Return 400 for malformed requests
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 4.4 Implement POST /api/webhook endpoint


    - Create server/routes/webhook.js
    - Accept incoming webhook payloads
    - Apply auth and validation middleware
    - Broadcast messages to SSE clients
    - _Requirements: 1.1, 2.1, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.5 Implement GET /api/messages/stream SSE endpoint


    - Add SSE endpoint in server/routes/messages.js
    - Maintain array of connected clients
    - Broadcast new messages to all clients
    - Handle client disconnections
    - _Requirements: 1.1, 2.1_
  
  - [x] 4.6 Implement POST /api/send endpoint for outgoing messages


    - Create endpoint to forward messages to external webhooks
    - Implement retry logic with exponential backoff (3 attempts)
    - Log transmission attempts
    - _Requirements: 3.2, 3.4, 3.5_

- [x] 5. Build PagerInterface component




  - [x] 5.1 Create PagerInterface component structure


    - Create src/components/PagerInterface.tsx
    - Set up component with message display area and input field
    - Apply monospace font and green-on-black styling
    - _Requirements: 1.2, 1.4_
  
  - [x] 5.2 Implement message display with character limit


    - Render messages from MessageContext
    - Truncate messages to 240 characters
    - Display scrollable history of last 50 messages
    - _Requirements: 1.2, 1.5_
  
  - [x] 5.3 Add beep notification sound


    - Create or import beep audio file
    - Play sound when new message arrives
    - Add sound toggle in preferences
    - _Requirements: 1.3_
  
  - [x] 5.4 Implement message sending functionality


    - Add input field and send button
    - Call ConfigContext outgoing webhook on submit
    - Clear input after successful send
    - _Requirements: 3.2_

- [x] 6. Build FaxInterface component





  - [x] 6.1 Create FaxInterface component structure


    - Create src/components/FaxInterface.tsx
    - Set up component with fax document display area and input field
    - _Requirements: 2.1_
  
  - [x] 6.2 Implement Canvas-based fax rendering utility


    - Create src/utils/faxRenderer.ts
    - Implement function to render message as fax document image
    - Apply paper texture background
    - Add fax header with timestamp
    - _Requirements: 2.2, 2.4_
  
  - [x] 6.3 Add visual effects to fax rendering

    - Apply scan lines effect
    - Add slight rotation and distortion
    - Apply noise/grain overlay
    - _Requirements: 2.2_
  
  - [x] 6.4 Implement transmission animation

    - Create progressive line-by-line rendering animation
    - Use requestAnimationFrame for smooth animation
    - Complete animation within 2-3 seconds
    - _Requirements: 2.3_
  
  - [x] 6.5 Implement fax document archive

    - Store rendered fax images (max 100)
    - Display archive with thumbnail view
    - Allow viewing full-size fax documents
    - _Requirements: 2.5_
  
  - [x] 6.6 Implement message sending functionality

    - Add input field and send button
    - Call ConfigContext outgoing webhook on submit
    - Clear input after successful send
    - _Requirements: 3.2_

- [x] 7. Build WebhookConfig component





  - [x] 7.1 Create WebhookConfig component with form


    - Create src/components/WebhookConfig.tsx
    - Add input fields for incoming and outgoing webhook URLs
    - Add auth token field and enable/disable toggle
    - _Requirements: 4.1, 4.2_
  
  - [x] 7.2 Implement URL validation

    - Validate URL format on input change
    - Display inline validation errors
    - Prevent saving invalid URLs
    - _Requirements: 4.3_
  
  - [x] 7.3 Implement configuration persistence

    - Save configuration to LocalStorage on form submit
    - Load configuration from LocalStorage on component mount
    - Update ConfigContext with new settings
    - _Requirements: 4.4_
  
  - [x] 7.4 Display current webhook endpoint

    - Show the backend webhook URL for incoming messages
    - Add copy-to-clipboard button
    - _Requirements: 4.5_

- [x] 8. Build StatusIndicator component




  - [x] 8.1 Create StatusIndicator component


    - Create src/components/StatusIndicator.tsx
    - Display visual indicator (dot or icon) with color coding
    - Show connected/disconnected/error states
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 8.2 Implement connection status logic


    - Check if webhooks are configured
    - Monitor SSE connection state
    - Update status on webhook send success/failure
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 8.3 Add configuration prompt for disconnected state


    - Display message prompting user to configure webhooks
    - Add button to open WebhookConfig
    - _Requirements: 7.3_

- [x] 9. Build ModeToggle component and implement mode switching




  - [x] 9.1 Create ModeToggle component


    - Create src/components/ModeToggle.tsx
    - Add toggle switch UI (pager/fax)
    - Style with smooth transition animations
    - _Requirements: 5.1_
  
  - [x] 9.2 Implement mode switching logic


    - Update ConfigContext mode preference on toggle
    - Persist mode to LocalStorage
    - Complete transition within 500ms
    - _Requirements: 5.1, 5.3, 5.5_
  
  - [x] 9.3 Ensure message history preservation


    - Verify MessageContext maintains messages across mode switches
    - Test switching between modes with existing messages
    - _Requirements: 5.2_

- [x] 10. Implement SSE client connection





  - [x] 10.1 Create SSE hook for real-time messages


    - Create src/hooks/useSSE.ts
    - Connect to GET /api/messages/stream endpoint
    - Parse incoming message events
    - Add messages to MessageContext
    - _Requirements: 1.1, 2.1_
  
  - [x] 10.2 Implement automatic reconnection

    - Detect SSE connection loss
    - Implement exponential backoff reconnection (1s, 2s, 4s, 8s)
    - Update ConnectionStatus during reconnection attempts
    - _Requirements: 7.5_

- [x] 11. Build main App component and routing





  - [x] 11.1 Create App component


    - Create src/App.tsx
    - Set up context providers (MessageContext, ConfigContext)
    - Implement conditional rendering for pager/fax modes
    - _Requirements: 5.1, 5.4_
  
  - [x] 11.2 Integrate all components


    - Add StatusIndicator to header
    - Add ModeToggle to header
    - Render PagerInterface or FaxInterface based on mode
    - Add settings button to open WebhookConfig
    - _Requirements: All_
  
  - [x] 11.3 Implement error boundaries


    - Add React error boundary for graceful error handling
    - Display fallback UI on component errors
    - Log errors to console
    - _Requirements: All_

- [x] 12. Add styling and responsive design




  - [x] 12.1 Create global styles and CSS variables


    - Create src/styles/global.css with retro theme variables
    - Define color schemes for pager (green-on-black) and fax (sepia tones)
    - Set up responsive breakpoints
    - _Requirements: 1.4_
  
  - [x] 12.2 Style PagerInterface with retro aesthetics


    - Apply monospace font and green-on-black color scheme
    - Add CRT screen effect (optional scanlines, glow)
    - Make responsive for mobile devices
    - _Requirements: 1.4_
  
  - [x] 12.3 Style FaxInterface with vintage aesthetics


    - Apply paper-like background
    - Style fax document display area
    - Make responsive for mobile devices
    - _Requirements: 2.2_

- [x] 13. Implement error handling and retry logic





  - [x] 13.1 Add error handling for message sending


    - Catch network errors on outgoing webhook calls
    - Display toast notification on failure
    - Add retry button to toast
    - _Requirements: 3.4_
  
  - [x] 13.2 Implement exponential backoff for retries


    - Create src/utils/retry.ts with retry logic
    - Implement 3 retry attempts with 1s, 2s, 4s delays
    - Log all retry attempts
    - _Requirements: 3.4, 3.5_
  
  - [x] 13.3 Add fallback for fax rendering failures


    - Catch Canvas API errors
    - Fall back to plain text display
    - Show warning message to user
    - _Requirements: Error Handling_

- [x] 14. Add testing





  - [x] 14.1 Write unit tests for utilities


    - Test sanitization functions
    - Test URL validation
    - Test LocalStorage helpers
    - Test retry logic
    - _Requirements: All_
  

  - [x] 14.2 Write component tests

    - Test PagerInterface message display and truncation
    - Test FaxInterface rendering
    - Test WebhookConfig validation and persistence
    - Test StatusIndicator state changes
    - _Requirements: All_
  

  - [x] 14.3 Write integration tests for backend

    - Test webhook endpoint with valid/invalid payloads
    - Test authentication middleware
    - Test SSE message broadcasting
    - Test outgoing webhook delivery
    - _Requirements: 3.1, 6.1, 6.2, 6.3, 6.4_

- [x] 15. Final integration and polish





  - [x] 15.1 Test complete message flow end-to-end


    - Send test webhook to backend
    - Verify message appears in both pager and fax modes
    - Test sending message from UI to external webhook
    - _Requirements: All_
  
  - [x] 15.2 Add loading states and transitions


    - Add loading spinner for message sending
    - Add smooth transitions between modes
    - Add fade-in animations for new messages
    - _Requirements: 5.5_
  
  - [x] 15.3 Optimize performance


    - Implement message virtualization for large histories
    - Optimize fax rendering performance
    - Minimize re-renders with React.memo
    - _Requirements: All_
  
  - [x] 15.4 Add README with setup instructions


    - Document how to run the application
    - Explain webhook configuration
    - Provide example webhook payloads
    - Include screenshots
    - _Requirements: All_
