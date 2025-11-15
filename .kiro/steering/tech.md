# Technology Stack

## Frontend

- **React 18.3.1**: UI framework with hooks (useState, useEffect, useRef, useCallback, useMemo)
- **Vite 6.0.1**: Build tool and development server with HMR
- **React Router DOM 6.28.0**: Client-side routing
- **CSS3**: Custom styling with animations, Grid, Flexbox, and CSS custom properties
- **TypeScript 5.0+**: Type checking support (configured but project uses JSX)

## Backend

- **Node.js**: Runtime environment
- **Express 4.21.1**: Web server framework
- **CORS 2.8.5**: Cross-origin resource sharing
- **Server-Sent Events (SSE)**: Real-time message delivery

## AI Integration

- **@lmstudio/sdk 1.5.0**: LM Studio JavaScript SDK for local LLM integration
- **LM Studio**: Local AI inference (optional, with automatic fallback)

## Development Tools

- **Vitest 4.0.8**: Testing framework with jsdom/happy-dom
- **@testing-library/react 16.3.0**: React component testing
- **@testing-library/jest-dom 6.9.1**: Custom Jest matchers
- **ESLint**: Code linting with TypeScript support
- **typescript-eslint**: TypeScript ESLint parser and rules
- **Concurrently 9.2.1**: Run multiple commands simultaneously

## Utilities

- **uuid 11.0.3**: Unique ID generation
- **dompurify 3.2.2**: XSS sanitization
- **supertest 7.1.4**: HTTP assertion testing

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server (port 5173)
npm run server           # Start Express backend (port 3001)
npm run dev:full         # Run both frontend and backend concurrently
```

### Building
```bash
npm run build            # TypeScript check + Vite production build
npm run preview          # Preview production build
npm run type-check       # Run TypeScript type checking only
```

### Testing
```bash
npm test                 # Run tests once (CI mode)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
```

### Examples
```bash
npm run example:llm      # Run LLM chatbot example
```

## Development Proxy Configuration

Vite dev server includes proxy configuration for:
- `/api` → `http://localhost:3001` (backend API)
- `/lmstudio` → `http://127.0.0.1:1234` (LM Studio local server)

The LM Studio proxy enables browser-based connections without CORS issues and supports WebSocket for streaming.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires modern JavaScript (ES6+) support.
