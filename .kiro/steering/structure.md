# Project Structure

## Root Directory

```
retro-messenger/
├── src/                    # Frontend React application
├── server/                 # Backend Express API
├── examples/               # Code examples and demos
├── public/                 # Static assets
├── dist/                   # Production build output
├── node_modules/           # Dependencies
└── [config files]          # vite.config.ts, tsconfig.json, etc.
```

## Frontend Structure (`src/`)

### Components (`src/components/`)
React components organized by feature:
- **View Components**: `PagerView.jsx`, `FaxView.jsx`, `FaxInterface.jsx`, `PagerInterface.jsx`
- **UI Components**: `Toast.jsx`, `StatusIndicator.jsx`, `SkeletonLoader.jsx`, `ErrorBoundary.jsx`
- **Layout Components**: `LayoutContainer.jsx`, `LayoutToggle.jsx`, `ControlSidebar.jsx`
- **Feature Components**: `LoginScreen.jsx`, `UserSelector.jsx`, `WebhookConfig.jsx`, `SettingsModal.jsx`
- **Toggle Components**: `ModeToggle.jsx`

Each component typically has:
- `.jsx` file - Component implementation
- `.css` file - Component-specific styles
- `.test.jsx` file - Component tests (where applicable)

### Services (`src/services/`)
Business logic and external integrations:
- `AuthService.js` - User authentication and session management
- `CryptoService.js` - E2EE encryption/decryption (RSA + AES)
- `MessagingService.js` - Real-time messaging via SSE
- `LLMChatbotService.js` - LM Studio integration for AI responses
- `LLMStudioLoader.js` - Model loading and connection management

### Hooks (`src/hooks/`)
Reusable React hooks:
- `useLLMChatbot.js` - LLM chatbot integration hook
- `useSSE.js` - Server-Sent Events connection hook
- `useConnectionStatus.js` - Connection status monitoring

### Contexts (`src/contexts/`)
React context providers for global state:
- `ConfigContext.jsx` - Application configuration
- `MessageContext.jsx` - Message state management

### Utils (`src/utils/`)
Utility functions and helpers:
- `constants.js` - Application constants (modes, delays, limits)
- `generateId.js` - Unique ID generation
- `logger.js` - Logging utility
- `sanitize.js` - Input sanitization (XSS prevention)
- `validation.js` - Input validation
- `storage.js` - LocalStorage wrapper
- `retry.js` - Retry logic for network requests
- `beep.js` - Audio notifications
- `cleanLLMResponse.js` - LLM response formatting
- `faxRenderer.js` - Fax document rendering
- `layoutConfig.js` - Layout configuration
- `performance.js` - Performance monitoring

Each utility has a corresponding `.test.js` file.

### Styles (`src/styles/`)
Global stylesheets:
- `global.css` - Global styles and CSS variables
- `toast.css` - Toast notification styles

### Types (`src/types/`)
Type definitions:
- `index.js` - JavaScript type definitions
- `index.ts` - TypeScript type definitions

### Test Setup (`src/test/`)
- `setup.js` - Vitest configuration and global test setup

### Root Files
- `App.jsx` - Main application component
- `App.css` - Main application styles
- `App.test.jsx` - Main app tests
- `App.integration.test.jsx` - Integration tests
- `App.accessibility.test.jsx` - Accessibility tests
- `App.errorHandling.test.jsx` - Error handling tests
- `main.jsx` - Application entry point
- `index.css` - Root styles

## Backend Structure (`server/`)

### Routes (`server/routes/`)
Express route handlers:
- `auth.js` - Authentication endpoints (register, login, logout)
- `messages.js` - Message retrieval endpoints
- `send.js` - Message sending endpoint
- `webhook.js` - Webhook endpoints

### Services (`server/services/`)
Backend business logic:
- `UserService.js` - User management and storage
- `MessageService.js` - Message storage and retrieval
- `WebSocketService.js` - SSE connection management

### Middleware (`server/middleware/`)
Express middleware:
- `auth.js` - Authentication middleware
- `validator.js` - Request validation middleware

### Utils (`server/utils/`)
Backend utilities:
- `retry.js` - Retry logic for operations

### Tests (`server/test/`)
Backend test suites:
- `integration.test.js` - Full flow integration tests
- `messages.test.js` - Message endpoint tests
- `middleware.test.js` - Middleware tests
- `multiuser.test.js` - Multi-user scenario tests
- `webhook.test.js` - Webhook endpoint tests

### Root File
- `index.js` - Express server entry point

## Examples Directory (`examples/`)

Working code samples:
- `llm-chatbot-example.js` - LM Studio integration example

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `PagerView.jsx`)
- **Services**: PascalCase with Service suffix (e.g., `AuthService.js`)
- **Hooks**: camelCase with use prefix (e.g., `useLLMChatbot.js`)
- **Utils**: camelCase (e.g., `generateId.js`)
- **Tests**: Same as source file with `.test.js` or `.test.jsx` suffix
- **Styles**: Same as component with `.css` suffix

### Code
- **Components**: PascalCase function names
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE (in `constants.js`)
- **Services**: camelCase singleton instances exported

## Import Patterns

### Relative Imports
```javascript
import Component from './components/Component';
import { utility } from './utils/utility';
import './styles/Component.css';
```

### Service Imports
```javascript
import { authService } from './services/AuthService';
import { llmChatbot } from './services/LLMChatbotService';
```

### Hook Imports
```javascript
import { useLLMChatbot } from './hooks/useLLMChatbot';
```

### Constant Imports
```javascript
import { MODE_PAGER, MODE_FAX, CHATBOT_USERNAME } from './utils/constants';
```

## Key Architectural Decisions

1. **Functional Components Only** - No class components
2. **Hooks for State** - useState, useEffect, useCallback, useMemo
3. **Service Layer Pattern** - Business logic separated from UI
4. **Custom Hooks** - Reusable stateful logic
5. **CSS Modules Alternative** - Component-scoped CSS files with BEM-like naming
6. **Test Co-location** - Tests next to source files
7. **ES Modules** - Modern import/export syntax throughout
8. **Memoization** - Performance optimization with useCallback/useMemo
9. **Error Boundaries** - Graceful error handling in UI
10. **Accessibility First** - ARIA labels on all interactive elements
