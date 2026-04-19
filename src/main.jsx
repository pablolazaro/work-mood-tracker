import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/inter'
import './index.css'
import { MoodProvider } from './context/MoodContext'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <MoodProvider>
        <App />
      </MoodProvider>
    </HashRouter>
  </StrictMode>
)
