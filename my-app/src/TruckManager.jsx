import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Truck, Trash2, Edit, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function TruckManager() {
  const [trucks, setTrucks] = useState([]);
  const [truckForm, setTruckForm] = useState({
    id: null,
    name: "",
    length_m: "",
    width_m: "",
    height_m: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from("trucks")
      .select("*")
      .order("created_at");
    if (error) {
      setError(error.message);
    } else {
      setTrucks(data || []);
    }
  };

  const upsertTruck = async () => {
    if (!truckForm.name.trim()) {
      setError("Le nom du camion est obligatoire");
      return;
    }

    if (!truckForm.length_m || !truckForm.width_m || !truckForm.height_m) {
      setError("Toutes les dimensions sont obligatoires");
      return;
    }

    const payload = {
      name: truckForm.name.trim(),
      length_m: parseFloat(truckForm.length_m),
      width_m: parseFloat(truckForm.width_m),
      height_m: parseFloat(truckForm.height_m),
    };

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = truckForm.id
      ? await supabase.from("trucks").update(payload).eq("id", truckForm.id)
      : await supabase.from("trucks").insert(payload);

    if (error) {
      setError(error.message);
    } else {
      await fetchTrucks();
      resetForm();
      setSuccess(
        truckForm.id
          ? "Camion mis à jour avec succès"
          : "Camion créé avec succès"
      );
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  };

  const deleteTruck = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce camion ?")) return;

    const { error } = await supabase.from("trucks").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      fetchTrucks();
      setSuccess("Camion supprimé avec succès");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const resetForm = () => {
    setTruckForm({
      id: null,
      name: "",
      length_m: "",
      width_m: "",
      height_m: "",
    });
    setError(null);
  };

  const editTruck = (truck) => {
    setTruckForm({
      id: truck.id,
      name: truck.name,
      length_m: truck.length_m.toString(),
      width_m: truck.width_m.toString(),
      height_m: truck.height_m.toString(),
    });
  };

  const calculateVolume = () => {
    const l = parseFloat(truckForm.length_m) || 0;
    const w = parseFloat(truckForm.width_m) || 0;
    const h = parseFloat(truckForm.height_m) || 0;
    return (l * w * h).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft size={20} />
            Retour
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <Truck className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Camions
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez votre flotte de véhicules
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus size={20} />
              {truckForm.id ? "Modifier le camion" : "Nouveau camion"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du camion *
                </label>
                <input
                  value={truckForm.name}
                  onChange={(e) =>
                    setTruckForm({ ...truckForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Camion A, Iveco 35T..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur (m) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={truckForm.length_m}
                    onChange={(e) =>
                      setTruckForm({ ...truckForm, length_m: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="7.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largeur (m) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={truckForm.width_m}
                    onChange={(e) =>
                      setTruckForm({ ...truckForm, width_m: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="2.4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hauteur (m) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={truckForm.height_m}
                    onChange={(e) =>
                      setTruckForm({ ...truckForm, height_m: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="2.0"
                  />
                </div>
              </div>

              {truckForm.length_m && truckForm.width_m && truckForm.height_m && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600">Volume total</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {calculateVolume()} m³
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={upsertTruck}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading
                    ? "Traitement..."
                    : truckForm.id
                    ? "Mettre à jour"
                    : "Créer"}
                </button>
                {truckForm.id && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
            <h2 className="text-xl font-semibold mb-6">
              Camions existants ({trucks.length})
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {trucks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Truck size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Aucun camion enregistré</p>
                  <p className="text-xs mt-2">
                    Utilisez le formulaire pour ajouter votre premier camion
                  </p>
                </div>
              )}

              {trucks.map((truck) => (
                <div
                  key={truck.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition group"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      {truck.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {truck.length_m}m × {truck.width_m}m × {truck.height_m}m
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mt-1">
                      {(
                        truck.length_m *
                        truck.width_m *
                        truck.height_m
                      ).toFixed(2)}{" "}
                      m³
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => editTruck(truck)}
                      className="p-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="Éditer"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteTruck(truck.id)}
                      className="p-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
          <h3 className="font-semibold text-gray-900 mb-2">
            💡 Conseils d'utilisation
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Les dimensions doivent être en mètres (exemple: 7.2m)</li>
            <li>
              • Le volume est calculé automatiquement (Longueur × Largeur ×
              Hauteur)
            </li>
            <li>
              • Les camions enregistrés seront disponibles dans l'optimisateur
              de tournées
            </li>
            <li>
              • Vous pouvez modifier ou supprimer un camion en le sélectionnant
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}