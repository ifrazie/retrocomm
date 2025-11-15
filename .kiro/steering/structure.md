# Project Structure

## Root Directory

```
retro-messenger/
├── src/                    # Frontend React application
├── server/                 # Backend Express server
├── public/                 # Static assets
├── examples/               # Example code and demos
├── dist/                   # Production build output
├── .kiro/                  # Kiro configuration and steering
├── .snapshots/             # Project snapshots
└── node_modules/           # Dependencies
```

## Frontend Structure (`src/`)

```
src/
├── components/             # React components
│   ├── Toast.jsx          # Toast notification component
│   ├── LoginScreen.jsx    # User authentication UI
│   └── UserSelector.jsx   # Recipient selection UI
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
│   └── useLLMChatbot.js  # LLM chatbot integration hook
├── services/              # Business logic and API clients
│   ├── LLMChatbotService.js    # LM Studio integration
│   ├── AuthService.js          # Authentication service
│   └── MessagingService.js     # Real-time messaging via SSE
├── styles/                # CSS modules and stylesheets
│   └── toast.css         # Toast notification styles
├── test/                  # Test utilities and setup
│   └── setup.js          # Vitest configuration
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
│   ├── constants.js      # Application constants
│   ├── generateId.js     # Unique ID generation
│   └── logger.js         # Logging utility
├── App.jsx               # Main application component
├── App.css               # Main application styles
├── main.jsx              # React entry point
└── index.css             # Global styles
```

## Backend Structure (`server/`)

```
server/
├── routes/               # Express route handlers
│   ├── auth.js          # Authentication endpoints
│   ├── messages.js      # Message retrieval endpoints
│   ├── send.js          # Message sending endpoints
│   └── webhook.js       # Webhook endpoints
├── services/            # Backend services
│   ├── UserService.js   # User management
│   └── WebSocketService.js  # SSE connection management
├── middleware/          # Express middleware
├── utils/               # Backend utilities
└── index.js            # Server entry point
```

## Configuration Files

- **vite.config.ts**: Vite build configuration with proxy setup
- **tsconfig.json**: TypeScript compiler options
- **tsconfig.node.json**: TypeScript config for Node.js files
- **eslint.config.js**: ESLint configuration with TypeScript support
- **package.json**: Dependencies and npm scripts

## Key Architectural Patterns

### Component Organization
- **Presentational components**: In `src/components/` (UI-focused)
- **Container component**: `App.jsx` (state management and business logic)
- **Custom hooks**: In `src/hooks/` (reusable stateful logic)
- **Services**: In `src/services/` (API clients and external integrations)

### State Management
- React hooks (useState, useEffect, useRef, useCallback, useMemo)
- No external state management library (Redux, Zustand, etc.)
- Local component state with prop drilling
- Service singletons for shared state (AuthService, MessagingService)

### Styling Approach
- CSS files co-located with components
- Global styles in `src/index.css` and `src/App.css`
- CSS custom properties for theming
- No CSS-in-JS or CSS modules (plain CSS)

### Testing Structure
- Test files co-located with source files (e.g., `App.test.jsx`)
- Test categories: unit, integration, accessibility, error handling
- Test setup in `src/test/setup.js`
- Vitest with jsdom/happy-dom for DOM simulation

### Backend Architecture
- RESTful API endpoints under `/api`
- Server-Sent Events (SSE) for real-time messaging
- In-memory data storage (no database)
- Service layer pattern for business logic

## File Naming Conventions

- **React components**: PascalCase with `.jsx` extension (e.g., `LoginScreen.jsx`)
- **Services**: PascalCase with `.js` extension (e.g., `AuthService.js`)
- **Utilities**: camelCase with `.js` extension (e.g., `generateId.js`)
- **Styles**: kebab-case or component name with `.css` extension
- **Tests**: Same name as source file with `.test.jsx` suffix

## Import Patterns

- Relative imports for local files: `import { logger } from './utils/logger'`
- Named exports preferred over default exports for utilities
- Default exports for React components
- Service singletons exported as instances: `export const authService = new AuthService()`

## Constants and Configuration

- Application constants in `src/utils/constants.js`
- Environment-specific config in Vite config
- No `.env` files (demo application)
- Hardcoded URLs for development (localhost:3001, localhost:1234)
