// App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DeliveryOptimizer from "./DeliveryOptimizer";
import TruckManager from "./TruckManager";
import MotorcycleManager from "./MotorcycleManager";

export default function App() {
  return (
    <Router>
      <nav className="bg-white shadow-md p-4 flex gap-4 border-b">
        <Link to="/" className="text-indigo-600 font-semibold">Optimisation</Link>
        <Link to="/trucks" className="text-indigo-600">Camions</Link>
        <Link to="/motorcycles" className="text-indigo-600">Motos</Link>
      </nav>

      <div className="p-6">
        <Routes>
          <Route path="/" element={<DeliveryOptimizer />} />
          <Route path="/trucks" element={<TruckManager />} />
          <Route path="/motorcycles" element={<MotorcycleManager />} />
        </Routes>
      </div>
    </Router>
  );
}
