import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.info('🚀 Gusmi Store Configured API URL:', import.meta.env.VITE_API_URL || 'FALLBACK: localhost');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
