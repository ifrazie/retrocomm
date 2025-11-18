import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { preloadLMStudioClient } from './services/LLMStudioLoader.js'

// Preload LM Studio SDK in the background to reduce perceived loading time
preloadLMStudioClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
