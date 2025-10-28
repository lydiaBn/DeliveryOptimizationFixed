import React, { useState } from 'react';
import { Truck, Package, MapPin, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, Navigation, Zap, Box, PieChart, AlertTriangle } from 'lucide-react';


const WEBHOOK_URL = import.meta.env.VITE_REACT_APP_WEBHOOK_URL; 
const AUTH_TOKEN = import.meta.env.VITE_REACT_APP_AUTH_TOKEN; 

const DeliveryOptimizer = () => {
  const [orders, setOrders] = useState('');
  const [maxVolume, setMaxVolume] = useState(30); // ✅ Updated default to 50m³
  const [allowOrderSplitting, setAllowOrderSplitting] = useState(true); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let ordersData;
      try {
        ordersData = JSON.parse(orders);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Format JSON invalide. Veuillez vérifier votre saisie.');
      }

      const payload = {
        orders: Array.isArray(ordersData.orders) ? ordersData.orders : ordersData, // ✅ Changed from 'response' to 'orders'
        maxVolume: parseFloat(maxVolume), // ✅ Changed from maxBikes
        allowOrderSplitting: allowOrderSplitting // ✅ NEW
      };

      console.log('Sending payload:', payload);

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

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResults(data);
      setActiveTab('results');
    } catch (err) {
      console.error('Error details:', err);
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
    "shipping_date": "2025-10-27T10:22:33",
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
    "shipping_date": "2025-10-28T17:15:55",
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
    "id": 10127,
    "number": "10127",
    "status": "ready for delivery",
    "date_created": "2025-10-21T17:15:55",
    "shipping_date": "2025-10-28T17:15:55",
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
    "shipping_date": "2025-10-28T17:15:55",
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
    "shipping_date": "2025-10-28T17:15:55",
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
    "shipping_date": "2025-10-28T17:15:55",
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
        "quantity": 10,
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
                  Optimisation des Itinéraires de Livraison
                </h1>
                <p className="text-gray-600 mt-1">Système intelligent de gestion de tournées basé sur le volume</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <Box className="text-indigo-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Capacité du Plateau</h3>
                </div>
                <label className="block text-sm text-gray-600 mb-2">
                  Volume maximal du plateau (m³)
                </label>
                <input
                  type="number"
                  value={maxVolume}
                  onChange={(e) => setMaxVolume(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                  min="1"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Le volume total que peut contenir le plateau de livraison
                </p>
              </div>

              {/* ✅ NEW: Order Splitting Toggle */}
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
                  Permet de diviser les commandes pour optimiser l'utilisation du plateau
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Truck className="text-indigo-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800">Commandes à Optimiser</h3>
                </div>
                <button
                  onClick={() => setOrders(JSON.stringify(exampleData, null, 2))}
                  className="px-4 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                >
                  Charger exemple
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Collez vos données de commandes au format JSON (depuis WooCommerce ou votre système). 
                <span className="font-semibold text-indigo-600"> Assurez-vous que chaque produit inclut volume_m3 ou les trois dimensions de la moto .</span>
              </p>
              <textarea
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                placeholder='[{"id": 10115, "status": "ready for delivery", "line_items": [{"volume_m3": 2.8, ...}], ...}]'
                className="w-full h-96 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 font-mono text-sm transition-all"
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
                  Optimiser les Tournées
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'results' && results && (
          <div className="space-y-6">
            {/* ✅ UPDATED: Stats Grid with Volume */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Truck size={24} className="opacity-80" />
                  <TrendingUp size={20} className="opacity-60" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary.totalBatches}</div>
                <div className="text-blue-100 text-sm">Tournées créées</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Package size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary.totalOrders}</div>
                <div className="text-purple-100 text-sm">Commandes optimisées</div>
              </div>

              {/* ✅ NEW: Volume Card */}
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Box size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary.totalVolume} m³</div>
                <div className="text-cyan-100 text-sm">Volume total</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <MapPin size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary.totalDistance.toFixed(1)} km</div>
                <div className="text-green-100 text-sm">Distance totale</div>
              </div>

              {/* ✅ NEW: Split Orders Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <PieChart size={24} className="opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{results.summary.totalSplitOrders || 0}</div>
                <div className="text-orange-100 text-sm">Commandes divisées</div>
              </div>
            </div>

            {/* ✅ NEW: Insights Section */}
            {results.insights && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={20} />
                  Insights d'Optimisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">Utilisation moyenne du plateau</div>
                    <div className="text-2xl font-bold text-indigo-600">{results.summary.avgVolumeUtilization}%</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">Tournée la plus efficace</div>
                    <div className="text-2xl font-bold text-green-600">{results.insights.mostEfficientBatch}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">Tournées critiques</div>
                    <div className="text-2xl font-bold text-red-600">{results.insights.criticalBatches}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {results.batches.map((batch) => (
                <div key={batch.batchId} className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-mono font-bold">
                          {batch.batchId}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">Tournée #{batch.batchNumber}</div>
                          <div className="text-indigo-100 text-sm">
                            {batch.totalOrders} livraisons • {batch.uniqueZones} zones
                            {batch.splitOrders > 0 && ` • ${batch.splitOrders} commande(s) divisée(s)`}
                          </div>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getUrgencyColor(batch.batchUrgencyLevel)}`}>
                        {translateUrgency(batch.batchUrgencyLevel)}
                      </div>
                    </div>
                  </div>

                  {/* ✅ UPDATED: Batch Stats with Volume */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Motos</div>
                      <div className="text-2xl font-bold text-gray-800">{batch.totalBikes}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Volume</div>
                      <div className="text-2xl font-bold text-gray-800">{batch.totalVolume} m³</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Utilisation</div>
                      <div className="text-2xl font-bold text-gray-800">{batch.volumeUtilization}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Distance</div>
                      <div className="text-2xl font-bold text-gray-800">{batch.totalDistance} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Montant total</div>
                      <div className="text-lg font-bold text-gray-800">{batch.totalAmount.toLocaleString()} DA</div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Navigation size={18} className="text-indigo-600" />
                      Itinéraire de livraison
                    </h4>
                    <div className="space-y-3">
                      {batch.deliveryRoute.map((stop) => (
                        <div key={`${stop.orderId}-${stop.stopNumber}`} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                          <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                            {stop.stopNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-gray-800">{stop.customerName}</div>
                                  {/* ✅ NEW: Split Order Indicator */}
                                  {stop.isPartialDelivery && (
                                    <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-md flex items-center gap-1">
                                      <PieChart size={12} />
                                      Livraison partielle
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">{stop.customerAddress} • {stop.zone}</div>
                                <div className="text-sm text-gray-500 mt-1">{stop.customerPhone}</div>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getUrgencyColor(stop.urgencyLevel)}`}>
                                {translateUrgency(stop.urgencyLevel)}
                              </div>
                            </div>

                            {/* ✅ NEW: Split Order Details */}
                            {stop.splitInfo && (
                              <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-orange-800 mb-1">
                                  <AlertTriangle size={14} />
                                  <span className="font-semibold">
                                    Partie {stop.splitInfo.partNumber}/{stop.splitInfo.totalParts} de la commande
                                  </span>
                                </div>
                                <div className="text-xs text-orange-700 space-y-1">
                                  <div>• Motos dans cette livraison: {stop.splitInfo.bikesInThisPart}</div>
                                  {stop.splitInfo.bikesRemaining && (
                                    <div>• Motos restantes: {stop.splitInfo.bikesRemaining} (livraison ultérieure)</div>
                                  )}
                                  {stop.splitInfo.bikesFromPreviousPart && (
                                    <div>• Motos précédentes: {stop.splitInfo.bikesFromPreviousPart} (déjà livrées)</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* ✅ UPDATED: Stop Info Grid with Volume */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package size={14} />
                                <span>
                                  {stop.bikesDelivered} moto(s)
                                  {stop.bikesRemaining > 0 && (
                                    <span className="text-orange-600 font-semibold"> ({stop.bikesRemaining} restantes)</span>
                                  )}
                                </span>
                              </div>
                              {/* ✅ NEW: Volume Display */}
                              <div className="flex items-center gap-2 text-gray-600">
                                <Box size={14} />
                                <span>{stop.volume} m³</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={14} />
                                <span>{stop.distance} km</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={14} />
                                <span>{stop.daysUntilDelivery}j restants</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                                {stop.amount.toLocaleString()} DA
                                {stop.isPartialDelivery && (
                                  <span className="text-xs text-gray-500">/{stop.totalOrderAmount.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {stop.products.map(p => `${p.name} (x${p.quantity}${p.volume_m3 ? `, ${p.volume_m3}m³` : ''})`).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.skippedOrders && results.skippedOrders.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Commandes non traitées ({results.skippedOrders.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {results.skippedOrders.map((order, idx) => (
                    <div key={idx} className="text-sm text-yellow-800 bg-white p-3 rounded-lg">
                      <span className="font-semibold">Commande #{order.orderId}:</span> {order.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOptimizer;