# Project Structure

## Root Directory

```
retro-messenger/
├── src/                    # Frontend React application
├── server/                 # Backend Express server
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration and steering
├── .snapshots/             # Project snapshots
├── node_modules/           # Dependencies
└── [config files]          # vite.config.js, eslint.config.js, etc.
```

## Frontend Structure (`src/`)

```
src/
├── components/             # React components
│   ├── PagerInterface.jsx/css      # Pager mode UI
│   ├── FaxInterface.jsx/css        # Fax mode UI
│   ├── StatusIndicator.jsx/css     # Connection status
│   ├── ModeToggle.jsx/css          # Interface switcher
│   ├── WebhookConfig.jsx/css       # Settings panel
│   └── Toast.jsx/css               # Notification system
├── contexts/               # React Context providers
│   ├── MessageContext.jsx          # Message queue management
│   └── ConfigContext.jsx           # App configuration
├── hooks/                  # Custom React hooks
│   ├── useSSE.js                   # Server-Sent Events
│   └── useConnectionStatus.js      # Connection monitoring
├── utils/                  # Utility functions
├── styles/                 # Global styles
├── test/                   # Test setup and utilities
├── types/                  # Type definitions (if using TypeScript)
├── assets/                 # Images, fonts, etc.
├── App.jsx                 # Root component
├── App.css                 # Root styles
├── main.jsx                # React entry point
└── index.css               # Global CSS
```

## Backend Structure (`server/`)

```
server/
├── routes/                 # Express route handlers
│   ├── webhook.js                  # POST /api/webhook (receive messages)
│   ├── messages.js                 # GET /api/messages/stream (SSE)
│   └── send.js                     # POST /api/send (send messages)
├── middleware/             # Express middleware
├── utils/                  # Server utilities
├── test/                   # Server tests
└── index.js                # Express app entry point
```

## Component Organization

### Component File Pattern
Each component typically includes:
- `ComponentName.jsx` - Component logic
- `ComponentName.css` - Component styles
- `ComponentName.test.jsx` - Component tests
- `ComponentName.example.jsx` - Usage examples (optional)

### Naming Conventions
- Components: PascalCase (e.g., `PagerInterface.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSSE.js`)
- Contexts: PascalCase with `Context` suffix (e.g., `MessageContext.jsx`)
- CSS classes: BEM-style with component prefix (e.g., `.PagerInterface__display`)
- Private methods: underscore prefix (e.g., `_handleClick`)

## Key Architectural Patterns

### Context Providers
- `ConfigProvider` - Wraps app for configuration management
- `MessageProvider` - Wraps app for message queue management
- Contexts loaded at root level in `App.jsx`

### Error Boundaries
- `ErrorBoundary` class component wraps main app content
- Catches rendering errors and displays fallback UI

### State Management
- Global state via Context API (messages, config)
- Local state via useState for component-specific data
- LocalStorage for persistence (preferences, webhook config)

### API Communication
- SSE for real-time incoming messages (`/api/messages/stream`)
- REST endpoints for sending messages and webhook configuration
- Vite proxy forwards `/api/*` requests to Express backend

## Testing Structure

Tests are co-located with components and use Vitest + Testing Library. Test setup is in `src/test/setup.js`.
