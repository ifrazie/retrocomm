# Technology Stack

## Build System & Tooling

- **Build Tool**: Vite 6.0+ (fast development server with HMR)
- **Package Manager**: npm
- **Module System**: ES Modules (type: "module" in package.json)
- **TypeScript**: Configured but optional (gradual migration approach)

## Frontend Stack

- **Framework**: React 18.3+ with hooks (functional components only)
- **Styling**: Pure CSS3 with CSS Grid, Flexbox, and custom properties
- **Routing**: React Router DOM 6.28+ (if needed for multi-page features)
- **State Management**: React hooks (useState, useEffect, useRef) - no external state library

## AI & Integration

- **LLM SDK**: @lmstudio/sdk ^1.5.0 for local AI model integration
- **Chatbot Service**: Custom singleton service (`src/services/LLMChatbotService.js`)
- **Proxy Configuration**: Vite dev proxy routes `/lmstudio` to `http://127.0.0.1:1234`

## Backend (Optional/Demo)

- **Server**: Express 4.21+ (for webhook endpoints in `server/` directory)
- **CORS**: cors ^2.8.5
- **Note**: Backend is optional; frontend works standalone

## Testing

- **Test Runner**: Vitest 4.0+ with jsdom/happy-dom environment
- **Testing Library**: @testing-library/react ^16.3.0
- **Test Utils**: @testing-library/user-event, @testing-library/jest-dom
- **Server Testing**: supertest ^7.1.4

## Utilities

- **UUID Generation**: uuid ^11.0.3
- **Sanitization**: dompurify ^3.2.2
- **TypeScript Execution**: tsx ^4.20.6 (for running examples)

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Building
npm run build            # TypeScript check + Vite build
npm run preview          # Preview production build

# Testing
npm test                 # Run tests once (CI mode)
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI

# Type Checking
npm run type-check       # Run TypeScript compiler without emitting files

# Backend (Optional)
npm run server           # Start Express server (http://localhost:3001)

# Examples
npm run example:llm      # Run LLM chatbot example
```

## Development Proxy Configuration

Vite proxy routes for local development:
- `/api` → `http://localhost:3001` (Express backend)
- `/lmstudio` → `http://127.0.0.1:1234` (LM Studio local server)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires modern JavaScript (ES2020) and CSS3 support.

## External Dependencies

**Optional**: LM Studio desktop application for AI chatbot functionality
- Download from https://lmstudio.ai
- Compatible models: Qwen2.5-7B-Instruct, Llama, etc.
- Default port: 1234
