# Project Structure

## Root Directory Layout

```
retro-messenger/
├── src/                    # Frontend React application
├── server/                 # Optional Express backend for webhooks
├── examples/               # Working code examples and demos
├── docs/                   # Documentation files
├── public/                 # Static assets
├── dist/                   # Production build output (generated)
├── node_modules/           # Dependencies (generated)
├── .kiro/                  # Kiro configuration and steering
├── .snapshots/             # Project snapshots
└── [config files]          # Root-level configuration
```

## Frontend Structure (`src/`)

### Core Application Files
- `main.jsx` - Application entry point, renders root component
- `App.jsx` - Main application component with mode switching and message handling
- `App.css` - Main application styles
- `App.test.jsx` - Application-level tests
- `index.css` - Global base styles (imported in main.jsx)
- `vite-env.d.ts` - Vite environment type definitions

### Directory Organization

#### `src/components/`
React components with co-located CSS files (component-name.css pattern):
- **Interface Components**: `PagerInterface.jsx`, `FaxInterface.jsx` - Main device UI
- **Layout Components**: `LayoutContainer.jsx`, `LayoutToggle.jsx` - Layout management
- **Control Components**: `ControlSidebar.jsx`, `ModeToggle.jsx` - User controls
- **Configuration**: `WebhookConfig.jsx` - Webhook settings panel
- **UI Elements**: `StatusIndicator.jsx`, `Toast.jsx`, `SkeletonLoader.jsx` - Reusable UI
- **Pattern**: Each component has matching `.css` file and optional `.test.jsx`

#### `src/hooks/`
Custom React hooks for shared logic:
- `useLLMChatbot.js` - LLM integration and response generation
- `useConnectionStatus.js` - Connection monitoring
- `useSSE.js` - Server-Sent Events handling

#### `src/services/`
Business logic and external integrations:
- `LLMChatbotService.js` - Singleton service for LM Studio integration
- `LLMChatbotService.test.js` - Service tests
- **Pattern**: Services are singletons with test files

#### `src/contexts/`
React Context providers for global state:
- `MessageContext.jsx` - Message state management
- `ConfigContext.jsx` - Configuration state management

#### `src/utils/`
Pure utility functions with tests:
- `sanitize.js` - Input sanitization (DOMPurify wrapper)
- `validation.js` - Input validation helpers
- `storage.js` - LocalStorage wrapper
- `retry.js` - Retry logic for network requests
- `beep.js` - Audio feedback utilities
- `faxRenderer.js` - Fax display rendering logic
- `layoutConfig.js` - Layout configuration helpers
- **Pattern**: Each utility has matching `.test.js` file

#### `src/styles/`
Global stylesheets:
- `global.css` - Global CSS variables, resets, and base styles

#### `src/types/`
Type definitions (TypeScript/JSDoc):
- `index.js` - JavaScript type definitions
- `index.ts` - TypeScript type definitions

#### `src/test/`
Test configuration and setup:
- `setup.js` - Vitest test environment setup

#### `src/assets/`
Static assets (images, icons):
- `react.svg` - React logo

## Backend Structure (`server/`)

Optional Express server for webhook functionality.

### Core Server File
- `index.js` - Express app setup and server initialization

### Directory Organization

#### `server/routes/`
Express route handlers:
- `webhook.js` - Incoming webhook endpoint
- `messages.js` - Message API endpoints
- `send.js` - Outgoing message sending

#### `server/middleware/`
Express middleware:
- `auth.js` - Authentication middleware (Bearer token)
- `validator.js` - Request validation middleware

#### `server/utils/`
Server-side utilities:
- `retry.js` - Retry logic for outgoing webhooks

#### `server/test/`
Backend tests:
- `webhook.test.js` - Webhook endpoint tests
- `messages.test.js` - Message API tests
- `middleware.test.js` - Middleware tests
- `integration.test.js` - End-to-end integration tests

## Examples Directory (`examples/`)

Working code samples demonstrating features:
- `llm-chatbot-example.js` - LLM integration example

## Documentation (`docs/`)

Technical documentation:
- `LLM_INTEGRATION.md` - LLM integration guide

## Configuration Files (Root)

- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration with proxy setup
- `tsconfig.json` - TypeScript configuration for src/
- `tsconfig.node.json` - TypeScript configuration for build tools
- `eslint.config.js` - ESLint configuration with TypeScript support
- `.gitignore` - Git ignore patterns

## Naming Conventions

### Files
- **React Components**: PascalCase (e.g., `PagerInterface.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLLMChatbot.js`)
- **Services**: PascalCase with `Service` suffix (e.g., `LLMChatbotService.js`)
- **Utilities**: camelCase (e.g., `sanitize.js`, `validation.js`)
- **Tests**: Same name as source with `.test.js` suffix
- **Styles**: Same name as component with `.css` suffix

### Code
- **Components**: PascalCase function names
- **Hooks**: camelCase with `use` prefix
- **Constants**: UPPER_SNAKE_CASE (e.g., `EXAMPLE_MESSAGES`)
- **Variables/Functions**: camelCase

## Import Patterns

```javascript
// External dependencies first
import React, { useState, useEffect } from 'react';
import { LMStudioClient } from '@lmstudio/sdk';

// Internal imports - absolute from src/
import { useLLMChatbot } from './hooks/useLLMChatbot';
import { llmChatbot } from './services/LLMChatbotService';

// Styles last
import './App.css';
```

## Key Architectural Patterns

1. **Component Co-location**: Each component has its CSS file in the same directory
2. **Singleton Services**: Services like `LLMChatbotService` use singleton pattern
3. **Custom Hooks**: Shared logic extracted into reusable hooks
4. **Context for Global State**: React Context for app-wide state (messages, config)
5. **Pure Utilities**: Utility functions are pure and testable
6. **Test Co-location**: Test files live next to source files
