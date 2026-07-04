import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

useUIStore.getState().initTheme()
void useAuthStore.getState().init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
