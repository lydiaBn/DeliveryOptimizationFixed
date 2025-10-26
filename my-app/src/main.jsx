import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DeliveryOptimizer from './DeliveryOptimizer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DeliveryOptimizer />
  </StrictMode>,
)
