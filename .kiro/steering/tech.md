# Technology Stack

## Frontend

- **React 18.3.1** - UI framework with hooks (useState, useEffect, useRef, useCallback, useMemo)
- **Vite 6.0.1** - Build tool and dev server with HMR
- **TypeScript 5.9.3** - Type checking (configured but project uses JSX/JS primarily)
- **CSS3** - Custom styling with Grid, Flexbox, animations, and custom properties

## Backend

- **Node.js** with ES modules (`"type": "module"`)
- **Express 4.21.1** - REST API server
- **Server-Sent Events (SSE)** - Real-time messaging without WebSockets
- **bcrypt 6.0.0** - Password hashing (10 rounds)

## Key Libraries

- **@lmstudio/sdk 1.5.0** - LM Studio integration for AI chatbot
- **uuid 11.0.3** - Unique ID generation
- **dompurify 3.2.2** - XSS protection for user input
- **react-router-dom 6.28.0** - Client-side routing
- **cors 2.8.5** - Cross-origin resource sharing

## Testing

- **Vitest 4.0.8** - Test runner with coverage
- **@testing-library/react 16.3.0** - Component testing
- **@testing-library/user-event 14.6.1** - User interaction simulation
- **jsdom 27.1.0** / **happy-dom 20.0.10** - DOM environment
- **supertest 7.1.4** - API endpoint testing

## Development Tools

- **ESLint** with TypeScript support (`typescript-eslint`)
- **concurrently 9.2.1** - Run multiple processes simultaneously
- **tsx 4.20.6** - TypeScript execution

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
npm run type-check       # Run TypeScript compiler without emitting files
```

### Testing
```bash
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
```

### Examples
```bash
npm run example:llm      # Run LM Studio chatbot example
```

## Configuration Files

- **vite.config.ts** - Vite configuration with proxy for `/api` (backend) and `/lmstudio` (LM Studio)
- **tsconfig.json** - TypeScript configuration (ES2020, strict mode, React JSX)
- **eslint.config.js** - ESLint flat config with TypeScript and React rules
- **package.json** - Dependencies and scripts

## Architecture Patterns

- **Component-based** - React functional components with hooks
- **Service layer** - Separate services for auth, messaging, LLM, crypto
- **Custom hooks** - Reusable logic (useLLMChatbot, useSSE, useConnectionStatus)
- **Context providers** - ConfigContext, MessageContext for state management
- **Error boundaries** - Graceful error handling in UI
- **Memoization** - useCallback and useMemo for performance optimization

## Security

- **E2EE** - RSA-2048 key pairs + AES-256-GCM message encryption
- **Password protection** - bcrypt hashing with 10 rounds
- **Private key encryption** - PBKDF2 with 100k iterations
- **XSS prevention** - DOMPurify sanitization
- **Zero-knowledge server** - Server cannot decrypt messages

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires modern JavaScript (ES6+) support.
