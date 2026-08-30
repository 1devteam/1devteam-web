import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const application = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, application)
} else {
  createRoot(root).render(application)
}
