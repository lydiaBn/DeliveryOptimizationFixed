import React, { useState } from 'react';
import { Truck, Package, MapPin, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, Navigation, Zap, Box, PieChart, AlertTriangle, Plus, Trash2 } from 'lucide-react';

const WEBHOOK_URL = import.meta.env.VITE_REACT_APP_WEBHOOK_URL; 
const AUTH_TOKEN = import.meta.env.VITE_REACT_APP_AUTH_TOKEN; 

const DeliveryOptimizer = () => {
  const [orders, setOrders] = useState('');
  const [trucks, setTrucks] = useState([
    { id: 1, name: 'Camion 1', length: 7, width: 4, height: 2 },
    { id: 1, name: 'Camion 2', length: 10, width: 5, height: 2 },
    { id: 1, name: 'Camion 3', length: 7, width: 4, height: 2 }
  ]);
  const [allowOrderSplitting, setAllowOrderSplitting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const addTruck = () => {
    const newTruck = {
      id: trucks.length + 1,
      name: `Camion ${trucks.length + 1}`,
      length: 7,
      width: 4,
      height: 2
    };
    setTrucks([...trucks, newTruck]);
  };

  const removeTruck = (id) => {
    if (trucks.length > 1) {
      setTrucks(trucks.filter(t => t.id !== id));
    }
  };

  const updateTruck = (id, field, value) => {
    setTrucks(trucks.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let ordersData;
      try {
        ordersData = JSON.parse(orders);
      } catch {
        throw new Error('Format JSON invalide. Veuillez vérifier votre saisie.');
      }

      const fleet = trucks.map(truck => ({
        truckId: truck.id,
        truckName: truck.name,
        dimensions: {
          length: parseFloat(truck.length),
          width: parseFloat(truck.width),
          height: parseFloat(truck.height)
        },
        maxVolume: parseFloat(truck.length) * parseFloat(truck.width) * parseFloat(truck.height)
      }));

      const payload = {
        orders: Array.isArray(ordersData.orders) ? ordersData.orders : ordersData,
        fleet: fleet,
        allowOrderSplitting: allowOrderSplitting
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`, 
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      setResults(data);
      setActiveTab('results');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError('Impossible de se connecter au serveur n8n. Vérifiez:\n1. Que le workflow n8n est actif\n2. Que CORS est activé dans les paramètres du webhook\n3. Que l\'URL est correcte');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const translateUrgency = (level) => {
    const translations = {
      'CRITICAL': 'CRITIQUE',
      'HIGH': 'ÉLEVÉE',
      'MEDIUM': 'MOYENNE',
      'LOW': 'FAIBLE'
    };
    return translations[level] || level;
  };

  const getUrgencyColor = (level) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getTruckColor = (truckId) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-cyan-500 to-cyan-600'
    ];
    return colors[(truckId - 1) % colors.length];
  };

  const exampleData =[
  {
    "id": 10115,
    "number": "10115",
    "status": "ready for delivery",
    "date_created": "2025-10-21T08:35:21",
    "shipping_date": "2025-10-29T08:35:21",
    "total": "42010500",
    "shipping_total": "2500",
    "payment_method_title": "Forfait",
    "billing": {
      "first_name": "Rachid",
      "last_name": "Belkacem",
      "address_1": "CITE IBN SINA N°75 RUE ABED ZIN",
      "city": "Oran",
      "email": "rachid.belkacem@gmail.com",
      "phone": "0541789456"
    },
    "line_items": [
      {
        "name": "TRK 502X",
        "sku": "TRK 02X",
        "quantity": 20,
        "price": 2100500,
        "width_cm": 230,
        "height_cm": 140,
        "length_cm": 87
      }
    ],
    "shipping_lines": [
      {
        "method_title": "CITE IBN SINA N°75 RUE ABED ZIN LOC N°01 ORAN"
      }
    ]
  },
  {
    "id": 10116,
    "number": "10116",
    "status": "ready for delivery",
    "date_created": "2025-10-21T09:15:42",
    "shipping_date": "2025-10-28T09:15:42",
    "total": "9250000",
    "shipping_total": "1500",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Amina",
      "last_name": "Boukhari",
      "address_1": "Cite 500 logements AADL",
      "city": "Alger",
      "email": "amina.boukhari@email.dz",
      "phone": "0771234589"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 5,
        "price": 1850000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "CITE ENTRE NORD EN FACE DE LA STATION SERVICE BAT 1335 PORTE 01 Alger HUSSEIN DEY"
      }
    ]
  },
  {
    "id": 10117,
    "number": "10117",
    "status": "ready for delivery",
    "date_created": "2025-10-21T10:22:33",
    "shipping_date": "2025-10-29T10:22:33",
    "total": "3300500",
    "shipping_total": "1000",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Kamel",
      "last_name": "Yahiaoui",
      "address_1": "Zone Industrielle, Lot 45",
      "city": "Blida",
      "email": "k.yahiaoui@gmail.com",
      "phone": "0661234890"
    },
    "line_items": [
      {
        "name": "TNT 150",
        "sku": "TNT 150",
        "quantity": 2,
        "price": 1650000,
        "width_cm": 200,
        "height_cm": 110,
        "length_cm": 82
      }
    ],
    "shipping_lines": [
      {
        "method_title": "LOCAL 05 RUE CHOUHADA CITE BOUDISA Blida CHIFFA"
      }
    ]
  },
  {
    "id": 10118,
    "number": "10118",
    "status": "ready for delivery",
    "date_created": "2025-10-21T11:45:15",
    "shipping_date": "2025-10-30T11:45:15",
    "total": "16503000",
    "shipping_total": "2000",
    "payment_method_title": "Forfait",
    "billing": {
      "first_name": "Nadia",
      "last_name": "Benmohamed",
      "address_1": "RN N°04 Zone d'activité Cne Oued Sly",
      "city": "Chlef",
      "email": "nadia.benmohamed@outlook.com",
      "phone": "0541234777"
    },
    "line_items": [
      {
        "name": "TRK 502X",
        "sku": "TRK 02X",
        "quantity": 8,
        "price": 2100000,
        "width_cm": 200,
        "height_cm": 110,
        "length_cm": 82
      }
    ],
    "shipping_lines": [
      {
        "method_title": "RN N°04 Zone d'activité Cne Oued Sly (W) Chlef"
      }
    ]
  },
  {
    "id": 10119,
    "number": "10119",
    "status": "ready for delivery",
    "date_created": "2025-10-21T12:30:55",
    "shipping_date": "2025-10-29T12:30:55",
    "total": "8250000",
    "shipping_total": "1200",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Youcef",
      "last_name": "Mansouri",
      "address_1": "Cité Baranes, Bouzareah",
      "city": "Alger",
      "email": "youcef.mansouri@yahoo.fr",
      "phone": "0791456123"
    },
    "line_items": [
      {
        "name": "TNT 150",
        "sku": "TNT 150",
        "quantity": 5,
        "price": 1650000,
        "width_cm": 200,
        "height_cm": 110,
        "length_cm": 82
      }
    ],
    "shipping_lines": [
      {
        "method_title": "Cité Baranes, Bouzareah (W) ALGER"
      }
    ]
  },
  {
    "id": 10120,
    "number": "10120",
    "status": "ready for delivery",
    "date_created": "2025-10-21T13:20:10",
    "shipping_date": "2025-10-25T13:20:10",
    "total": "5550000",
    "shipping_total": "1000",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Salima",
      "last_name": "Djabri",
      "address_1": "24 ROUT AIN BENIAN",
      "city": "Alger",
      "email": "salima.djabri@hotmail.com",
      "phone": "0661789234"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 3,
        "price": 1850000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "24 ROUT AIN BENIAN CHERAGA - ALGER"
      }
    ]
  },
  {
    "id": 10121,
    "number": "10121",
    "status": "ready for delivery",
    "date_created": "2025-10-21T14:10:30",
    "shipping_date": "2025-10-29T14:10:30",
    "total": "3300000",
    "shipping_total": "800",
    "payment_method_title": "Forfait",
    "billing": {
      "first_name": "Mehdi",
      "last_name": "Hamidi",
      "address_1": "80 RUE MAHMOUD BOUDJATITE",
      "city": "Alger",
      "email": "mehdi.hamidi@gmail.com",
      "phone": "0551890456"
    },
    "line_items": [
      {
        "name": "TNT 150",
        "sku": "TNT 150",
        "quantity": 2,
        "price": 1650000,
        "width_cm": 200,
        "height_cm": 110,
        "length_cm": 82
      }
    ],
    "shipping_lines": [
      {
        "method_title": "80 RUE MAHMOUD BOUDJATITE KOUBA/ALGER"
      }
    ]
  },
  {
    "id": 10122,
    "number": "10122",
    "status": "ready for delivery",
    "date_created": "2025-10-21T15:25:45",
    "shipping_date": "2025-10-30T15:25:45",
    "total": "12600000",
    "shipping_total": "2000",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Farida",
      "last_name": "Mammeri",
      "address_1": "CITE IBN SINA N°75 RUE ABED ZIN LOC N°01",
      "city": "ORAN",
      "email": "farida.mammeri@email.dz",
      "phone": "0541678234"
    },
    "line_items": [
      {
        "name": "TRK 502X",
        "sku": "TRK 02X",
        "quantity": 5,
        "price": 2100000,
        "width_cm": 230,
        "height_cm": 140,
        "length_cm": 87
      }
    ],
    "shipping_lines": [
      {
        "method_title": "CITE IBN SINA N°75 RUE ABED ZIN LOC N°01 ORAN"
      }
    ]
  },
  {
    "id": 10129,
    "number": "10129",
    "status": "ready for delivery",
    "date_created": "2025-10-21T16:40:20",
    "shipping_date": "2025-10-26T16:40:20",
    "total": "9900000",
    "shipping_total": "1500",
    "payment_method_title": "Forfait",
    "billing": {
      "first_name": "Sofiane",
      "last_name": "Zerouki",
      "address_1": "Lotissement Bouchaoui, Villa 23",
      "city": "Alger",
      "email": "sofiane.zerouki@yahoo.fr",
      "phone": "0771234456"
    },
    "line_items": [
      {
        "name": "TNT 150",
        "sku": "TNT 150",
        "quantity": 6,
        "price": 1650000,
        "width_cm": 200,
        "height_cm": 110,
        "length_cm": 82
      }
    ],
    "shipping_lines": [
      {
        "method_title": "62A, lotissement des Jeunes Aveugles Cne Draria (W) Alger"
      }
    ]
  },
  {
    "id": 10128,
    "number": "10128",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-10-29T17:15:55",
    "total": "6600000",
    "shipping_total": "1800",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Djamila",
      "last_name": "Latrech",
      "address_1": "ité Si El Houas 02 Cne Hassi Messaoud",
      "city": "Ouargla",
      "email": "djamila.latrech@gmail.com",
      "phone": "0661456789"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 6,
        "price": 1650000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "Cité Si El Houas 02 Cne Hassi Messaoud (W) Ouargla"
      }
    ]
  },
  {
    "id": 10127,
    "number": "10127",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-10-29T17:15:55",
    "total": "6600000",
    "shipping_total": "1800",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Hassane",
      "last_name": "Latrech",
      "address_1": "Cité Si El Houas 02 Cne Hassi Messaoud",
      "city": "Ouargla",
      "email": "Hassane.latrech@gmail.com",
      "phone": "0661456789"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 4,
        "price": 1650000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "Cité Si El Houas 02 Cne Hassi Messaoud (W) Ouargla"
      }
    ]
  },
  {
    "id": 10126,
    "number": "10126",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-10-30T17:15:55",
    "total": "16500000",
    "shipping_total": "1800",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Hajer",
      "last_name": "Latrech",
      "address_1": "LOTISSEMENT RN N° 04-OUED FEDA",
      "city": "CHLEF",
      "email": "djamila.latrech@gmail.com",
      "phone": "0661456789"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 10,
        "price": 1650000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "LOTISSEMENT RN N° 04-OUED FEDA (W) CHLEF"
      }
    ]
  },
  {
    "id": 10125,
    "number": "10125",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-11-01T17:15:55",
    "total": "1650000",
    "shipping_total": "1800",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Mohamed",
      "last_name": "Latrech",
      "address_1": "LOTISSEMENT RN N° 04-OUED FEDA",
      "city": "CHLEF",
      "email": "djamila.latrech@gmail.com",
      "phone": "0661456789"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 1,
        "price": 1650000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "RN N°04 Zone d'activité Cne Oued Sly (W) Chlef."
      }
    ]
  },
  {
    "id": 10155,
    "number": "10155",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-11-01T17:15:55",
    "total": "16500000",
    "shipping_total": "1800",
    "payment_method_title": "Paiement à la livraison",
    "billing": {
      "first_name": "Ibrahim",
      "last_name": "Latrech",
      "address_1": "LOCAL 56 KIFFANE RESIDANCE IBN MISSAIB",
      "city": "TLEMCEN",
      "email": "djamila.latrech@gmail.com",
      "phone": "0661456789"
    },
    "line_items": [
      {
        "name": "TRK 251",
        "sku": "TRK 251",
        "quantity": 15,
        "price": 1650000,
        "width_cm": 220,
        "height_cm": 125,
        "length_cm": 80
      }
    ],
    "shipping_lines": [
      {
        "method_title": "LOCAL 56 KIFFANE RESIDANCE IBN MISSAIB(W) TLEMCEN"
      }
    ]
  }
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Navigation className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Optimisation Multi-Camions
                </h1>
                <p className="text-gray-600 mt-1">Système intelligent de gestion de flotte</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'input'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('results')}
                disabled={!results}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'results' && results
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 disabled:opacity-50'
                }`}
              >
                Résultats 
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'input' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="text-indigo-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Configuration de la Flotte</h3>
                </div>
                <button
                  onClick={addTruck}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                  <Plus size={18} />
                  Ajouter un camion
                </button>
              </div>

              <div className="space-y-4">
                {trucks.map((truck) => (
                  <div key={truck.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={truck.name}
                        onChange={(e) => updateTruck(truck.id, 'name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 outline-none px-2 py-1"
                      />
                      {trucks.length > 1 && (
                        <button
                          onClick={() => removeTruck(truck.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Longueur (m)</label>
                        <input
                          type="number"
                          value={truck.length}
                          onChange={(e) => updateTruck(truck.id, 'length', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          min="1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Largeur (m)</label>
                        <input
                          type="number"
                          value={truck.width}
                          onChange={(e) => updateTruck(truck.id, 'width', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          min="1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Hauteur (m)</label>
                        <input
                          type="number"
                          value={truck.height}
                          onChange={(e) => updateTruck(truck.id, 'height', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                          min="0.5"
                          step="0.1"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full p-3 bg-indigo-50 rounded-lg">
                          <div className="text-xs text-indigo-600 mb-1">Volume</div>
                          <div className="text-lg font-bold text-indigo-700">
                            {(truck.length * truck.width * truck.height).toFixed(2)} m³
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">Capacité totale de la flotte:</span> {trucks.reduce((sum, t) => sum + (t.length * t.width * t.height), 0).toFixed(2)} m³
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="text-indigo-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Division des Commandes</h3>
              </div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={allowOrderSplitting}
                    onChange={(e) => setAllowOrderSplitting(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block w-14 h-8 rounded-full transition-all ${allowOrderSplitting ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all ${allowOrderSplitting ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-800">
                    {allowOrderSplitting ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Permet de diviser les commandes entre plusieurs camions
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Package className="text-indigo-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Commandes à Optimiser</h3>
                </div>
                <button
                  onClick={() => setOrders(JSON.stringify(exampleData, null, 2))}
                  className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                >
                  Charger exemple
                </button>
              </div>
              <textarea
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                placeholder='[{"id": 10115, "status": "ready for delivery", ...}]'
                className="w-full h-64 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 font-mono text-sm transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">Erreur</h4>
                  <p className="text-red-700 text-sm mt-1 whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleOptimize}
              disabled={loading || !orders}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Optimiser la Flotte
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'results' && results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Truck size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary?.trucksUsed || 0}</div>
                <div className="text-blue-100 text-sm">Camions utilisés</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Navigation size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary?.totalBatches || 0}</div>
                <div className="text-purple-100 text-sm">Tournées créées</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Package size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary?.totalOrders || 0}</div>
                <div className="text-cyan-100 text-sm">Commandes</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Box size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary?.avgVolumeUtilization || 0}%</div>
                <div className="text-green-100 text-sm">Utilisation moy.</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <MapPin size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary?.totalDistance?.toFixed(1) || 0} km</div>
                <div className="text-orange-100 text-sm">Distance totale</div>
              </div>
            </div>

            {results.truckAssignments && results.truckAssignments.map((truck) => (
              <div key={truck.truckId} className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${getTruckColor(truck.truckId)} px-6 py-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Truck size={32} />
                      <div>
                        <div className="font-bold text-xl">{truck.truckName}</div>
                        <div className="text-white/80 text-sm">
                          {truck.batches.length} tournée(s) • {truck.totalOrders} livraisons • {truck.totalVolume} m³
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{truck.volumeUtilization}%</div>
                      <div className="text-white/80 text-sm">Utilisation</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {truck.batches.map((batch) => (
                    <div key={batch.batchId} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-800">{batch.batchId}</div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${getUrgencyColor(batch.batchUrgencyLevel)}`}>
                            {translateUrgency(batch.batchUrgencyLevel)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {batch.totalOrders} arrêts • {batch.totalVolume} m³ • {batch.totalDistance} km
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {batch.deliveryRoute.map((stop) => (
                          <div key={`${stop.orderId}-${stop.stopNumber}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                              {stop.stopNumber}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{stop.customerName}</div>
                              <div className="text-xs text-gray-600">{stop.zone}</div>
                            </div>
                            <div className="text-xs text-gray-600">{stop.bikesDelivered} motos</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOptimizer;