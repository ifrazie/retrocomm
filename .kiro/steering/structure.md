# Project Structure

## Root Directory

```
retro-messenger/
├── src/                    # Frontend source code
├── server/                 # Backend API (optional)
├── public/                 # Static assets
├── dist/                   # Production build output
├── .kiro/                  # Kiro configuration and steering
├── .snapshots/             # Project snapshots
├── node_modules/           # Dependencies
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Project metadata and scripts
```

## Frontend Structure (`/src`)

```
src/
├── components/             # React components (with co-located CSS)
│   ├── PagerInterface.jsx/css
│   ├── FaxInterface.jsx/css
│   ├── ModeToggle.jsx/css
│   ├── WebhookConfig.jsx/css
│   ├── StatusIndicator.jsx/css
│   ├── Toast.jsx/css
│   └── *.test.jsx         # Component tests
├── contexts/               # React Context providers
│   ├── ConfigContext.jsx  # Webhook configuration state
│   └── MessageContext.jsx # Message state management
├── hooks/                  # Custom React hooks
│   ├── useConnectionStatus.js
│   └── useSSE.js          # Server-Sent Events hook
├── utils/                  # Utility functions
│   ├── sanitize.js        # XSS protection
│   ├── validation.js      # Input validation
│   ├── storage.js         # LocalStorage helpers
│   ├── retry.js           # Retry logic
│   ├── beep.js            # Audio notifications
│   ├── faxRenderer.js     # Fax display logic
│   ├── layoutConfig.js    # Layout configuration
│   └── *.test.js          # Unit tests
├── styles/                 # Global styles
│   └── global.css
├── test/                   # Test configuration
│   └── setup.js           # Vitest setup
├── types/                  # Type definitions/constants
│   └── index.js
├── assets/                 # Images, icons
├── App.jsx                 # Main application component
├── App.css                 # Main application styles
├── main.jsx                # React entry point
└── index.css               # Base styles
```

## Backend Structure (`/server`)

```
server/
├── routes/                 # API route handlers
│   ├── webhook.js         # Incoming webhook endpoint
│   ├── messages.js        # Message CRUD operations
│   └── send.js            # Outgoing message sender
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication logic
│   └── validator.js       # Request validation
├── utils/                  # Server utilities
│   └── retry.js           # Retry logic for webhooks
├── test/                   # Backend tests
│   ├── webhook.test.js
│   ├── messages.test.js
│   ├── middleware.test.js
│   └── integration.test.js
└── index.js                # Express server entry point
```

## Key Conventions

### Component Organization
- Each component has its own `.jsx` and `.css` file
- Component tests are co-located as `*.test.jsx`
- Components are self-contained and reusable

### State Management
- Global state via Context API (ConfigContext, MessageContext)
- Local state with useState for component-specific data
- Custom hooks for shared stateful logic

### Styling
- Component-scoped CSS files (not CSS modules)
- Global styles in `src/styles/global.css`
- Retro aesthetic with CSS animations and custom properties
- BEM-like naming conventions for CSS classes

### Testing
- Unit tests for utilities (`*.test.js`)
- Component tests for React components (`*.test.jsx`)
- Integration tests for API endpoints (in `server/test/`)
- Test files co-located with source files

### File Naming
- React components: PascalCase (e.g., `PagerInterface.jsx`)
- Utilities/hooks: camelCase (e.g., `useConnectionStatus.js`)
- CSS files: Match component name (e.g., `PagerInterface.css`)
- Test files: Match source file with `.test` suffix

### Import Patterns
- Absolute imports from `src/` root
- Named exports preferred over default exports for utilities
- Default exports for React components
