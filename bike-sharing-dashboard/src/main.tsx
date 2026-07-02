import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { CityProvider } from './context/CityContext'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CityProvider>
        <App />
      </CityProvider>
    </BrowserRouter>
  </StrictMode>,
)
