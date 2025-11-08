# Technology Stack

## Frontend

- **React 18.3** - UI framework with hooks for state management
- **Vite 6.0** - Build tool and development server
- **React Router DOM 6.28** - Client-side routing
- **DOMPurify 3.2** - XSS protection and content sanitization
- **Canvas API** - Fax document rendering with texture effects

## Backend

- **Node.js** with ES modules (`"type": "module"`)
- **Express 4.21** - Web server framework
- **CORS 2.8** - Cross-origin resource sharing
- **UUID 11.0** - Unique message ID generation
- **Server-Sent Events (SSE)** - Real-time message streaming

## Testing

- **Vitest 4.0** - Test runner
- **Testing Library** - React component testing
- **Happy-DOM / JSDOM** - DOM environment for tests
- **Supertest 7.1** - HTTP assertion library

## Development Tools

- **ESLint** - Code linting with React hooks plugin
- **Vite Dev Server** - Hot module replacement
- **Proxy Configuration** - `/api` routes proxied to backend

## Common Commands

### Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run server       # Start Express backend (port 3001)
```

### Testing
```bash
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
```

### Build & Deploy
```bash
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

## Architecture Notes

- Frontend and backend run as separate processes in development
- API requests from frontend are proxied to backend via Vite config
- SSE connection established on app load for real-time messaging
- Context API used for global state (MessageContext, ConfigContext)
- LocalStorage used for persisting user preferences and configuration
