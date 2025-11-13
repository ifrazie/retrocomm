# Technology Stack

## Frontend

- **React 18** - Component-based UI with hooks (useState, useEffect, useRef)
- **Vite** - Fast development server and optimized production builds
- **CSS3** - Custom styling with animations, Grid, Flexbox, CSS Custom Properties
- **JavaScript ES6+** - Modern JavaScript with modules

## Backend (Optional)

- **Express.js** - REST API server for webhook handling
- **Node.js** - Runtime environment
- **CORS** - Cross-origin resource sharing middleware

## Key Dependencies

- `react` & `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `uuid` - Unique identifier generation
- `dompurify` - XSS sanitization
- `express` & `cors` - Backend server (optional)

## Development Tools

- **Vitest** - Unit testing framework with jsdom/happy-dom
- **Testing Library** - React component testing (@testing-library/react, @testing-library/jest-dom)
- **ESLint** - Code linting with React hooks plugin
- **Supertest** - HTTP assertion testing

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run server           # Start Express backend (http://localhost:3001)

# Building
npm run build            # Production build to /dist
npm run preview          # Preview production build

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
```

## Build Configuration

- **Vite Config**: API proxy to localhost:3001, jsdom test environment
- **ESLint Config**: React hooks rules, browser globals, ES2020+
- **Test Setup**: Global test utilities in `src/test/setup.js`

## Architecture Pattern

- **Component-based**: Modular React components with co-located CSS
- **Context API**: State management via React Context (ConfigContext, MessageContext)
- **Custom Hooks**: Reusable logic (useConnectionStatus, useSSE)
- **Utility Functions**: Shared helpers in `/src/utils` and `/server/utils`
