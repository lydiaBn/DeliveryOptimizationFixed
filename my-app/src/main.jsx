import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import DeliveryOptimizer from './DeliveryOptimizer.jsx'
import MotorcycleManager from './MotorcycleManager.jsx'
import TruckManager from './TruckManager.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeliveryOptimizer />} />
        <Route path="/motorcycles" element={<MotorcycleManager />} />
        <Route path="/trucks" element={<TruckManager />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)