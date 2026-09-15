import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadRoute } from './routeModules.ts'

const root = document.getElementById('root')!
const application = (
  <StrictMode>
    <App />
  </StrictMode>
)

function mount() {
  if (root.hasChildNodes()) {
    hydrateRoot(root, application)
  } else {
    createRoot(root).render(application)
  }
}

if (root.hasChildNodes()) {
  void preloadRoute(window.location.pathname).then(mount, mount)
} else {
  mount()
}
