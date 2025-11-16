# Technology Stack

## Build System & Tooling

- **Build Tool**: Vite 6.0+ (fast development server with HMR)
- **Package Manager**: npm
- **Language**: JavaScript (ES6+) with TypeScript support configured
- **Linting**: ESLint with TypeScript ESLint parser
- **Testing**: Vitest with React Testing Library, jsdom/happy-dom

## Frontend Stack

### Core Framework
- **React 18.3+** with Hooks (useState, useEffect, useRef, useCallback, useMemo)
- **React Router DOM 6.28+** for routing
- **React DOM 18.3+** for rendering

### Styling
- **Pure CSS3** with custom properties (CSS variables)
- **CSS Grid & Flexbox** for layouts
- **CSS Animations** for retro effects (scanning lines, typing indicators, LED alerts)
- **Responsive Design** with mobile-first approach

### Key Libraries
- **@lmstudio/sdk 1.5+** - LM Studio JavaScript SDK for AI chatbot integration
- **DOMPurify 3.2+** - XSS protection for user-generated content
- **uuid 11.0+** - Unique ID generation for messages

## Backend Stack (Node.js/Express)

### Server Framework
- **Express 4.21+** - Web server framework
- **CORS 2.8+** - Cross-origin resource sharing
- **bcrypt 6.0+** - Password hashing (10 rounds)

### Architecture
- **RESTful API** endpoints for auth, messaging, webhooks
- **Server-Sent Events (SSE)** for real-time message delivery
- **In-memory storage** (no database - demo/hackathon project)

## Development Tools

### TypeScript Configuration
- Target: ES2020
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Strict mode enabled
- Configured but not enforced (gradual migration path)

### Testing Setup
- **Vitest** with globals enabled
- **jsdom** environment for DOM testing
- **@testing-library/react** for component testing
- **@testing-library/user-event** for interaction testing
- **@testing-library/jest-dom** for custom matchers
- **supertest** for API testing
- **@vitest/coverage-v8** for coverage reports

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
npm run preview          # Preview production build locally
npm run type-check       # Run TypeScript type checking only
```

### Testing
```bash
npm test                 # Run all tests once (CI mode)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
```

### Examples
```bash
npm run example:llm      # Run LLM chatbot example (requires LM Studio)
```

## Proxy Configuration

Vite dev server includes proxies for:
- `/api` → `http://localhost:3001` (backend API)
- `/lmstudio` → `http://127.0.0.1:1234` (LM Studio local server)

**Note**: Proxies only work in development mode. Production deployments need proper backend configuration.

## External Dependencies

### LM Studio (Optional)
- Download from [lmstudio.ai](https://lmstudio.ai)
- Required for AI chatbot functionality
- Runs locally on port 1234 (default)
- Any compatible LLM model (e.g., qwen2.5-7b-instruct)

### Browser Requirements
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Modern JavaScript (ES6+) support required

## Security Libraries

### Cryptography
- **Web Crypto API** (built-in) - RSA-2048 key generation, AES-256-GCM encryption
- **bcrypt** - Password hashing with salt rounds
- **PBKDF2** (built-in) - Key derivation for private key encryption

### Sanitization
- **DOMPurify** - XSS prevention for user-generated content
- Input validation throughout application

## Performance Optimizations

- React.memo for expensive components
- useCallback/useMemo for function/value memoization
- CSS-based animations (GPU accelerated)
- Efficient state management with minimal re-renders
- Message display limits (5 for pager, unlimited for fax)
- Auto-scroll using refs instead of DOM queries

## Development Workflow

1. Install dependencies: `npm install`
2. Start backend: `npm run server` (optional for multi-user features)
3. Start frontend: `npm run dev`
4. (Optional) Start LM Studio with a loaded model
5. Open browser to `http://localhost:5173`
6. Run tests: `npm test`

## Known Issues

- ESLint may require manual installation of `typescript-eslint` dependency
- LM Studio proxy only works in development (Vite dev server)
- Session storage cleared on page refresh (security feature for E2EE)
