import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Truck,
  Package,
  Navigation,
  Zap,
  AlertCircle,
  Upload,
  Send,
  CheckCircle,
  Star,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

const WEBHOOK_URL = import.meta.env.VITE_REACT_APP_WEBHOOK_URL;
const AUTH_TOKEN = import.meta.env.VITE_REACT_APP_AUTH_TOKEN;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DeliveryOptimizer = () => {
  // State management
  
  const [ordersText, setOrdersText] = useState("");
  const [parsedOrders, setParsedOrders] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [selectedTruckIds, setSelectedTruckIds] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [allowOrderSplitting, setAllowOrderSplitting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("input");
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategories, setFeedbackCategories] = useState({
    routeQuality: false,
    volumeUtilization: false,
    deliveryTime: false,
    other: false,
  });

  // Load data on mount
  useEffect(() => {
    fetchTrucks();
    fetchMotorcycles();
  }, []);

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from("trucks")
      .select("*")
      .order("created_at");
    if (error) {
      console.error("fetchTrucks error", error);
      setError("Impossible de charger la liste des camions");
      return;
    }
    setAvailableTrucks(data || []);
  };

  const fetchMotorcycles = async () => {
    const { data, error } = await supabase
      .from("motorcycles")
      .select("*")
      .order("name");
    if (error) {
      console.error("fetchMotorcycles error", error);
      setError("Impossible de charger la liste des motos");
      return;
    }
    setMotorcycles(data || []);
  };

  // Handle truck selection (multi-select)
  const toggleTruckSelection = (truckId) => {
    setSelectedTruckIds((prev) =>
      prev.includes(truckId)
        ? prev.filter((id) => id !== truckId)
        : [...prev, truckId]
    );
  };

  // Excel upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
        
        setParsedOrders(json);
        setOrdersText(JSON.stringify(json, null, 2));
        setError(null);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier Excel");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Get motorcycle by name
  const getMotorcycleByName = (name) => {
    if (!name) return null;
    return motorcycles.find(
      (m) => m.name.toLowerCase() === String(name).toLowerCase()
    );
  };

  // Enrich orders with motorcycle dimensions from database
  const enrichOrders = (orders) => {
    return (orders || []).map((order) => {
      if (Array.isArray(order.line_items)) {
        order.line_items = order.line_items.map((li) => {
          // Always try to match from database, ignore any dimensions in the order
          if (li.name) {
            const moto = getMotorcycleByName(li.name);
            if (moto) {
              // Remove any existing dimensions and use database values
              const { width_cm: _width_cm, height_cm: _height_cm, length_cm: _length_cm, ...restOfItem } = li;
              return {
                ...restOfItem,
                width_cm: moto.width_cm,
                height_cm: moto.height_cm,
                length_cm: moto.length_cm,
              };
            }
          }
          // If no match found, keep original item (might be missing dimensions)
          return li;
        });
      }
      return order;
    });
  };

  // Main optimization handler
  const handleOptimize = async () => {
    if (selectedTruckIds.length === 0) {
      setError("Veuillez sélectionner au moins un camion");
      return;
    }

    if (!ordersText || ordersText.trim().length === 0) {
      setError("Veuillez charger des commandes (JSON ou Excel)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let ordersData;
      try {
        const parsed = JSON.parse(ordersText);
        ordersData = Array.isArray(parsed) ? parsed : parsed.orders || [parsed];
      } catch (parseErr) {
        console.error(parseErr);
        setError("Format JSON invalide");
        setLoading(false);
        return;
      }

      const enrichedOrders = enrichOrders(ordersData);

      // Validate that all motorcycles were matched
      const unmatchedMotos = new Set();
      enrichedOrders.forEach(order => {
        if (Array.isArray(order.line_items)) {
          order.line_items.forEach(li => {
            if (li.name && (!li.width_cm || !li.height_cm || !li.length_cm)) {
              unmatchedMotos.add(li.name);
            }
          });
        }
      });

      if (unmatchedMotos.size > 0) {
        const unmatchedList = Array.from(unmatchedMotos).join(', ');
        setError(
          `⚠️ Motos non trouvées dans la base de données: ${unmatchedList}\n\n` +
          `Veuillez les ajouter dans la page "Gérer Motos" avant de continuer.`
        );
        setLoading(false);
        return;
      }

      // Build fleet from selected trucks
      const selectedTrucks = availableTrucks.filter((t) =>
        selectedTruckIds.includes(t.id)
      );

      const fleetPayload = selectedTrucks.map((t) => ({
        truckId: t.id,
        truckName: t.name,
        dimensions: {
          length: parseFloat(t.length_m),
          width: parseFloat(t.width_m),
          height: parseFloat(t.height_m),
        },
        maxVolume:
          parseFloat(t.length_m) *
          parseFloat(t.width_m) *
          parseFloat(t.height_m),
      }));

      const payload = {
        orders: enrichedOrders,
        fleet: fleetPayload,
        allowOrderSplitting: allowOrderSplitting,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        mode: "cors",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${text}`);
      }

      const data = await response.json();
      setResults(data);
      setActiveTab("results");
      setShowFeedback(false);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Erreur lors de l'optimisation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback
  const submitFeedback = async () => {
    try {
      setLoading(true);
      const payload = {
        rating: parseInt(rating, 10),
        comment: feedbackText,
        categories: feedbackCategories,
        context: results || {},
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("feedback").insert(payload);
      if (error) throw error;

      alert("Merci pour votre retour !");
      setShowFeedback(false);
      setRating(0);
      setFeedbackText("");
      setFeedbackCategories({
        routeQuality: false,
        volumeUtilization: false,
        deliveryTime: false,
        other: false,
      });
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer le feedback");
    } finally {
      setLoading(false);
    }
  };

  const formatVolumeM3 = (t) =>
    (parseFloat(t.length_m) * parseFloat(t.width_m) * parseFloat(t.height_m)).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
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
                <p className="text-gray-600 mt-1">
                  Système intelligent de gestion de flotte
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Link
                to="/trucks"
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                Gérer Camions
              </Link>
              <Link
                to="/motorcycles"
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                Gérer Motos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("input")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "input"
                ? "bg-white shadow-md text-indigo-600"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("results")}
            disabled={!results}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "results" && results
                ? "bg-white shadow-md text-indigo-600"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Résultats
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "input" && (
          <div className="space-y-6">
            {/* Fleet Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="text-indigo-600" size={24} />
                <h3 className="text-xl font-semibold">Sélection de la Flotte</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    onClick={() => toggleTruckSelection(truck.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedTruckIds.includes(truck.id)
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{truck.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {truck.length_m}m × {truck.width_m}m × {truck.height_m}m
                        </div>
                        <div className="text-sm text-indigo-600 font-medium mt-2">
                          {formatVolumeM3(truck)} m³
                        </div>
                      </div>
                      {selectedTruckIds.includes(truck.id) && (
                        <CheckCircle className="text-indigo-600" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTruckIds.length > 0 && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm font-medium text-indigo-900">
                    {selectedTruckIds.length} camion(s) sélectionné(s)
                  </div>
                </div>
              )}
            </div>

            {/* Orders Upload */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package className="text-indigo-600" size={24} />
                  <h3 className="text-xl font-semibold">Commandes</h3>
                </div>
                <div className="flex gap-2">
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition flex items-center gap-2">
                    <Upload size={18} />
                    Importer Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                value={ordersText}
                onChange={(e) => {
                  setOrdersText(e.target.value);
                  setParsedOrders(null);
                }}
                placeholder="Collez JSON ici ou importez un fichier Excel..."
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              {parsedOrders && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">
                    {Array.isArray(parsedOrders) ? parsedOrders.length : 1} commande(s) chargée(s)
                  </span>
                </div>
              )}

              {/* Order Splitting Toggle */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-900">
                      Autoriser le fractionnement des commandes
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Permet de diviser une commande volumineuse entre plusieurs camions
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allowOrderSplitting}
                      onChange={(e) => setAllowOrderSplitting(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setAllowOrderSplitting(!allowOrderSplitting)}
                      className={`w-14 h-8 rounded-full transition ${
                        allowOrderSplitting ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition ${
                          allowOrderSplitting ? "translate-x-7" : "translate-x-1"
                        } mt-1`}
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={handleOptimize}
                disabled={loading || selectedTruckIds.length === 0 || !ordersText}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Optimisation en cours...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Optimiser les Tournées
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "results" && results && (
          <div className="space-y-6">
           {/* Summary Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  <StatCard
    title="Camions utilisés"
    value={results.summary?.trucksUsed || 0}
    icon={<Truck size={24} />}
    color="from-sky-500 to-blue-600" // 🚚 cool blue
  />
  <StatCard
    title="Tournées"
    value={results.summary?.totalBatches || 0}
    icon={<Navigation size={24} />}
    color="from-emerald-400 to-green-600" // 🧭 fresh green
  />
  <StatCard
    title="Commandes"
    value={results.summary?.totalOrders || 0}
    icon={<Package size={24} />}
    color="from-fuchsia-500 to-pink-600" // 📦 vibrant pink/purple
  />
  <StatCard
    title="Utilisation moyenne."
    value={`${results.summary?.avgVolumeUtilization || 0}%`}
    icon={<Zap size={24} />}
    color="from-amber-400 to-orange-500" // ⚡ warm orange
  />
  <StatCard
  title="Distance Moy. par Tournée"
  value={`${results.summary?.avgDistance || 0} km`}
  icon={<Truck size={24} />}
  color="from-purple-400 to-purple-600"
/>

</div>
            {/* Unassigned Batches Warning */}
           {results.unassignedBatches && results.unassignedBatches.length > 0 && (
  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          ⚠️ Tournées non assignées ({results.unassignedBatches.length})
        </h3>
        <p className="text-sm text-orange-800 mb-4">
          Ces tournées n'ont pas pu être assignées à un camion en raison de contraintes de capacité.
        </p>

        <div className="space-y-3">
          {results.unassignedBatches.map((batch, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {batch.batchId || `Batch #${idx + 1}`}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Volume requis : <strong>{batch.volume} m³</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Commandes : <strong>{batch.totalOrders}</strong> • Motos : <strong>{batch.totalBikes}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Niveau Urgence :{" "}
                    <span
                      className={`font-semibold ${
                        batch.urgencyLevel === "CRITICAL"
                          ? "text-red-600"
                          : batch.urgencyLevel === "HIGH"
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {batch.urgencyLevel}
                    </span>
                  </p>
                  {batch.zones?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Zones : {batch.zones.join(", ")}
                    </p>
                  )}
                </div>

                <div className="text-sm text-orange-700 italic max-w-xs text-right">
                  {batch.reason}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-orange-100 rounded-lg p-4">
          <p className="text-sm text-orange-900 font-semibold">
            💡 Solutions possibles :
          </p>
          <ul className="text-sm text-orange-800 mt-2 space-y-1 ml-4 list-disc">
            <li>Ajouter des camions avec plus de capacité</li>
            <li>Activer le fractionnement des commandes</li>
            <li>Réduire le nombre de commandes simultanées</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}


            {/* Skipped Orders Warning */}
            {results.skippedOrders && results.skippedOrders.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      ⚠️ Commandes ignorées ({results.skippedOrders.length})
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      Ces commandes n'ont pas pu être traitées en raison de données manquantes ou incorrectes.
                    </p>
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-yellow-900 hover:text-yellow-700">
                        Voir les détails
                      </summary>
                      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                        {results.skippedOrders.map((order, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  Commande #{order.orderId}
                                </div>
                                {order.zoneName && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Zone: {order.zoneName}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-yellow-700 italic text-right max-w-xs">
                                {order.reason}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            )}

            {/* Truck Assignments */}
<div className="space-y-4">
  {results.truckAssignments?.map((truck) => (
    <div
      key={truck.truckId}
      className="bg-white rounded-2xl shadow-md p-4 lg:p-6 border border-indigo-50"
    >
      {/* Truck header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              {truck.truckName}
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              {truck.totalOrders} commande(s) • {truck.totalVolume} m³
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-sm">
                <span className="text-gray-600">Utilisation</span>{" "}
                <span className="font-semibold text-indigo-600">{truck.volumeUtilization}%</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Motos totales</span>{" "}
                <span className="font-semibold text-gray-800">{truck.totalBikes ?? "—"}</span>
              </div>
              <div className="text-sm flex items-center gap-2">
                <span className="text-gray-600">Urgence moy.</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    truck.avgUrgency >= 80
                      ? "bg-red-100 text-red-700"
                      : truck.avgUrgency >= 50
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {truck.avgUrgency ?? 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* right side small stats for quick scan */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-500">Utilisation</span>
            <span className="text-lg font-bold text-indigo-600">{truck.volumeUtilization}%</span>
          </div>

          {/* compact progress ring bar (visual emphasis) */}
          <div className="w-36">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
                style={{ width: `${truck.volumeUtilization}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">{truck.volumeUtilization}% rempli</div>
          </div>
        </div>
      </div>

      {/* Batches list — compact summary rows */}
      <div className="mt-4 space-y-3">
        {truck.batches
          ?.filter((batch) => batch && batch.batchId)
          .map((batch) => (
            <details
              key={batch.batchId}
              className="group bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm"
            >
              <summary className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  {/* urgency badge */}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      batch.batchUrgencyLevel === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : batch.batchUrgencyLevel === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {batch.batchUrgencyLevel}
                  </span>

                  <div className="text-sm">
                    <div className="font-medium text-gray-800">
                      {batch.batchId} • {batch.totalOrders} cmd • {batch.totalBikes ?? 0} motos
                    </div>
                    <div className="text-xs text-gray-500">
                      {batch.totalVolume ?? batch.volume} m³ • {batch.totalDistance ?? 0} km
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {batch.splitOrders > 0 && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                      {batch.splitOrders} fractionnée(s)
                    </span>
                  )}
                  <span className="text-xs text-gray-400 group-open:hidden">+</span>
                  <span className="text-xs text-gray-400 hidden group-open:inline">−</span>
                </div>
              </summary>

              {/* details panel — more readable, with color accents */}
              <div className="mt-3 pl-3 space-y-3 text-sm">
                {/* batch top row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium text-gray-800">Batch:</span>{" "}
                    {batch.batchId} • <span className="font-medium">{batch.totalOrders} commandes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-600">Volume</div>
                    <div className="text-sm font-semibold text-gray-800">{batch.totalVolume ?? batch.volume} m³</div>

                    <div className="text-xs text-gray-600">Distance</div>
                    <div className="text-sm font-semibold text-gray-800">{batch.totalDistance ?? 0} km</div>

                    <div>
                    </div>
                  </div>
                </div>

                {/* deliveryRoute stops — visually grouped and easier to scan */}
                <div className="space-y-2">
                  {batch.deliveryRoute?.map((stop) => (
                    <div key={stop.stopNumber} className="bg-white rounded-md p-3 border border-gray-100 flex items-start gap-3">
                      <div className="w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-800">
                              Stop {stop.stopNumber}: {stop.customerName}
                            </div>
                            <div className="text-xs text-gray-500  font-semibold mt-1">{stop.zone}</div>
                          </div>

                          {/* right-side compact column */}
                          <div className="text-right text-xs text-gray-500 min-w-[110px]">
                            <div className="mb-1">
                              <span className="block font-semibold text-indigo-600">
                                {(typeof stop.totalOrderAmount !== "undefined" && stop.totalOrderAmount !== null)
                                  ? Number(stop.totalOrderAmount).toLocaleString()
                                  : (typeof stop.amount !== "undefined" ? Number(stop.amount).toLocaleString() : "—")
                                } DZD
                              </span>
                            </div>
                            <div className="text-xs">
                              <div>{(stop.volume ?? stop.totalVolume ?? 0)} m³</div>
                              <div>{(stop.distance ?? stop.totalDistance ?? 0)} km</div>
                            </div>
                          </div>
                        </div>

                        {/* products and bikes */}
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-s text-gray-600">
                            <span className="font-medium">Commande</span> #{stop.orderId ?? stop.order_id ?? "—"} •{" "}
                            <span className="font-medium">{stop.totalBikesInOrder ?? stop.totalBikes ?? stop.bikeCount ?? 0} moto(s)</span>
                            {Array.isArray(stop.products) && stop.products.length > 0 && (
                              <div className="text-s text-gray-500 mt-1">{stop.products.map((p) => p.name).join(", ")}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* daysUntilDelivery pill */}
                            <div className={`text-xs px-2 py-1 rounded font-semibold ${
                              stop.daysUntilDelivery < 0 ? "bg-red-100 text-red-700" :
                              stop.daysUntilDelivery <= 2 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                            }`}>
                              {typeof stop.daysUntilDelivery !== "undefined" ? `${stop.daysUntilDelivery} j` : "—"}
                            </div>

                            {/* urgency pill */}
                            {stop.urgencyLevel && (
                              <div className={`text-xs px-2 py-1 rounded font-semibold ${
                                stop.urgencyLevel === "CRITICAL" ? "bg-red-100 text-red-700" :
                                stop.urgencyLevel === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                              }`}>
                                {stop.urgencyLevel}
                              </div>
                            )}

                            {/* partial delivery */}
                            {stop.isPartialDelivery && (
                              <div className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                                🔸 Partiel {stop.bikeCount}/{stop.totalBikesInOrder ?? stop.totalBikes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* shipping date */}
                        {stop.shippingDate && (
                      <div className="text-sm text-indigo-700 font-semibold mt-2">
                            Livraison : {new Date(stop.shippingDate).toLocaleDateString()} ({stop.daysUntilDelivery ?? "—"} j)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
      </div>
    </div>
  ))}
</div>


            {/* Feedback Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition"
              >
                Donner votre avis
              </button>
            </div>

            {/* Feedback Form */}
            {showFeedback && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
                <h3 className="text-xl font-semibold mb-4">Votre Feedback</h3>

                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Évaluation globale
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={32}
                        className={`cursor-pointer transition ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Qu'est-ce qui pourrait être amélioré ?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(feedbackCategories).map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={feedbackCategories[key]}
                          onChange={(e) =>
                            setFeedbackCategories({
                              ...feedbackCategories,
                              [key]: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg"
                    rows={4}
                    placeholder="Partagez vos suggestions..."
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    onClick={submitFeedback}
                    disabled={rating === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced StatCard
const StatCard = ({ title, value, icon, color = "from-indigo-500 to-purple-600" }) => {
  
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl shadow-md p-5 text-white transition-transform transform hover:scale-[1.03] hover:shadow-lg`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="p-2 bg-white/20 rounded-lg">{icon}</span>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-extrabold">{value}</p>
          <p className="text-sm font-medium opacity-90">{title}</p>
        </div>
      </div>
    </div>
  );
};
export default DeliveryOptimizer;