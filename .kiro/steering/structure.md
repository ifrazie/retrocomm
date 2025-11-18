# Project Structure

## Root Directory Layout

```
retro-messenger/
├── .git/                    # Git version control
├── .kiro/                   # Kiro AI assistant configuration
│   ├── settings/            # Kiro settings (MCP, etc.)
│   └── steering/            # AI guidance documents
├── .snapshots/              # Project snapshots/backups
├── .vscode/                 # VS Code workspace settings
├── dist/                    # Production build output (generated)
├── node_modules/            # npm dependencies (generated)
├── public/                  # Static assets
├── server/                  # Express backend
├── src/                     # React frontend source
├── examples/                # Example code and demos
└── [config files]           # Root-level configuration
```

## Frontend Structure (`src/`)

```
src/
├── components/              # React components
│   ├── LoginScreen.jsx      # Authentication UI
│   ├── UserSelector.jsx     # Recipient selection UI
│   └── Toast.jsx            # Toast notification component
├── contexts/                # React Context providers
├── hooks/                   # Custom React hooks
│   └── useLLMChatbot.js     # LLM integration hook
├── services/                # Business logic & API clients
│   ├── AuthService.js       # Authentication & crypto
│   ├── LLMChatbotService.js # LM Studio integration
│   └── MessagingService.js  # Real-time messaging (SSE)
├── styles/                  # CSS modules and themes
│   └── toast.css            # Toast notification styles
├── test/                    # Test utilities and setup
│   └── setup.js             # Vitest configuration
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
│   ├── constants.js         # App-wide constants
│   ├── generateId.js        # Unique ID generation
│   └── logger.js            # Logging utility
├── App.jsx                  # Main application component
├── App.css                  # Main application styles
├── App.test.jsx             # Unit tests for App
├── App.integration.test.jsx # Integration tests
├── App.accessibility.test.jsx # A11y tests
├── App.errorHandling.test.jsx # Error handling tests
├── main.jsx                 # React entry point
├── index.css                # Global styles
└── vite-env.d.ts            # Vite type definitions
```

## Backend Structure (`server/`)

```
server/
├── middleware/              # Express middleware
├── routes/                  # API route handlers
│   ├── auth.js              # Authentication endpoints
│   ├── messages.js          # Message retrieval
│   ├── send.js              # Message sending
│   └── webhook.js           # Webhook endpoints
├── services/                # Backend business logic
│   ├── UserService.js       # User management
│   └── WebSocketService.js  # SSE connection management
├── test/                    # Backend tests
└── index.js                 # Express server entry point
```

## Configuration Files

### Build & Development
- `vite.config.ts` - Vite configuration with proxies and test setup
- `tsconfig.json` - TypeScript compiler options (strict mode)
- `tsconfig.node.json` - TypeScript config for Node.js files
- `eslint.config.js` - ESLint rules with TypeScript support

### Package Management
- `package.json` - Dependencies and npm scripts
- `package-lock.json` - Locked dependency versions

### Project Documentation
- `README.md` - Comprehensive project documentation
- `API_DOCUMENTATION.md` - API endpoint documentation
- `SECURITY.md` - Security architecture details (implied)
- `TEST_*.md` - Test reports and analysis
- `TROUBLESHOOTING_LLM.md` - LLM integration troubleshooting

### Git
- `.gitignore` - Files excluded from version control

## Key Architectural Patterns

### Component Organization
- **Presentational Components**: UI-only components in `src/components/`
- **Container Component**: `App.jsx` manages state and orchestrates
- **Custom Hooks**: Reusable logic in `src/hooks/`
- **Services**: External integrations and API clients in `src/services/`

### State Management
- **Local State**: React useState for component-specific state
- **Lifted State**: Shared state in App.jsx passed via props
- **No Global State Library**: Intentionally simple for demo/hackathon scope

### Service Layer Pattern
- **AuthService**: Handles authentication, key generation, encryption
- **MessagingService**: Manages SSE connections and message delivery
- **LLMChatbotService**: Singleton service for LM Studio integration

### Testing Strategy
- **Unit Tests**: Individual component and function tests (`*.test.jsx`)
- **Integration Tests**: End-to-end user flows (`*.integration.test.jsx`)
- **Accessibility Tests**: ARIA and keyboard navigation (`*.accessibility.test.jsx`)
- **Error Handling Tests**: Edge cases and error scenarios (`*.errorHandling.test.jsx`)

## File Naming Conventions

### React Components
- **PascalCase** for component files: `LoginScreen.jsx`, `UserSelector.jsx`
- **PascalCase** for component names: `function LoginScreen() {}`

### Services & Utilities
- **PascalCase** for service files: `AuthService.js`, `LLMChatbotService.js`
- **camelCase** for utility files: `generateId.js`, `logger.js`
- **camelCase** for exported instances: `export const authService = new AuthService()`

### Tests
- **Component.test.jsx** for unit tests
- **Component.integration.test.jsx** for integration tests
- **Component.accessibility.test.jsx** for a11y tests
- **Component.errorHandling.test.jsx** for error tests

### Styles
- **kebab-case** for CSS files: `toast.css`
- **Component.css** for component-specific styles: `App.css`

## Import Conventions

### Relative Imports
```javascript
// Services
import { authService } from './services/AuthService';
import { llmChatbot } from './services/LLMChatbotService';

// Components
import LoginScreen from './components/LoginScreen';
import Toast from './components/Toast';

// Utilities
import { generateMessageId } from './utils/generateId';
import { logger } from './utils/logger';

// Hooks
import { useLLMChatbot } from './hooks/useLLMChatbot';
```

### External Imports
```javascript
// React
import React, { useState, useEffect, useCallback } from 'react';

// Libraries
import { LMStudioClient } from '@lmstudio/sdk';
import DOMPurify from 'dompurify';
```

## Constants Organization

Centralized in `src/utils/constants.js`:
- Display limits (MAX_PAGER_MESSAGES = 5)
- Timing values (WEBHOOK_DELAY_MS, TOAST_DURATION_MS)
- Configuration defaults
- Magic numbers extracted to named constants

## Asset Organization

### Public Assets
- `public/vite.svg` - Vite logo
- Static files served directly without processing

### Source Assets
- `src/assets/` - Images, fonts, icons processed by Vite
- Currently minimal (retro aesthetic uses CSS)

## Build Output (`dist/`)

Generated by `npm run build`:
- Optimized JavaScript bundles
- Minified CSS
- Static assets with cache-busting hashes
- `index.html` entry point

## Examples Directory

- `examples/llm-chatbot-example.js` - Standalone LM Studio integration demo
- Demonstrates service usage outside React context
- Useful for testing and documentation

## Notes on Architecture

### Why No Database?
- Demo/hackathon project scope
- In-memory storage sufficient for proof-of-concept
- Simplifies deployment and testing
- Production would use PostgreSQL/MongoDB

### Why No Redux/MobX?
- Application state is simple enough for React hooks
- Avoids over-engineering for current scope
- Easy to add later if needed

### Why Separate Server?
- Demonstrates full-stack architecture
- Real-time messaging via SSE
- Webhook endpoint hosting
- Production-ready separation of concerns

### Security Architecture
- Private keys never leave client browser
- Server stores only encrypted messages
- Zero-knowledge architecture by design
- See SECURITY.md for detailed documentation
