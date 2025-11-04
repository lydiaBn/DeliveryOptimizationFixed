import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bike, Trash2, Edit, Plus, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function MotorcycleManager() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [filteredMotorcycles, setFilteredMotorcycles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [motoForm, setMotoForm] = useState({
    id: null,
    name: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    notes: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMotorcycles(motorcycles);
    } else {
      const filtered = motorcycles.filter((moto) =>
        moto.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMotorcycles(filtered);
    }
  }, [searchTerm, motorcycles]);

  const fetchMotorcycles = async () => {
    const { data, error } = await supabase
      .from("motorcycles")
      .select("*")
      .order("name");
    if (error) {
      setError(error.message);
    } else {
      setMotorcycles(data || []);
      setFilteredMotorcycles(data || []);
    }
  };

  const upsertMotorcycle = async () => {
    if (!motoForm.name.trim()) {
      setError("Le nom du modèle est obligatoire");
      return;
    }

    if (!motoForm.length_cm || !motoForm.width_cm || !motoForm.height_cm) {
      setError("Toutes les dimensions sont obligatoires");
      return;
    }

    const payload = {
      name: motoForm.name.trim(),
      length_cm: parseFloat(motoForm.length_cm),
      width_cm: parseFloat(motoForm.width_cm),
      height_cm: parseFloat(motoForm.height_cm),
      notes: motoForm.notes?.trim() || null,
    };

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = motoForm.id
      ? await supabase.from("motorcycles").update(payload).eq("id", motoForm.id)
      : await supabase.from("motorcycles").insert(payload);

    if (error) {
      setError(error.message);
    } else {
      await fetchMotorcycles();
      resetForm();
      setSuccess(
        motoForm.id
          ? "Moto mise à jour avec succès"
          : "Moto créée avec succès"
      );
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  };

  const deleteMotorcycle = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette moto ?")) return;

    const { error } = await supabase.from("motorcycles").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      fetchMotorcycles();
      setSuccess("Moto supprimée avec succès");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const resetForm = () => {
    setMotoForm({
      id: null,
      name: "",
      length_cm: "",
      width_cm: "",
      height_cm: "",
      notes: "",
    });
    setError(null);
  };

  const editMotorcycle = (moto) => {
    setMotoForm({
      id: moto.id,
      name: moto.name,
      length_cm: moto.length_cm.toString(),
      width_cm: moto.width_cm.toString(),
      height_cm: moto.height_cm.toString(),
      notes: moto.notes || "",
    });
  };

  const calculateVolume = () => {
    const l = parseFloat(motoForm.length_cm) || 0;
    const w = parseFloat(motoForm.width_cm) || 0;
    const h = parseFloat(motoForm.height_cm) || 0;
    return ((l * w * h) / 1000000).toFixed(4);
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
              <Bike className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Motos
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les modèles de motos et leurs dimensions
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
              {motoForm.id ? "Modifier la moto" : "Nouvelle moto"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du modèle *
                </label>
                <input
                  value={motoForm.name}
                  onChange={(e) =>
                    setMotoForm({ ...motoForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: TRK 502X, Leoncino 500..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={motoForm.length_cm}
                    onChange={(e) =>
                      setMotoForm({ ...motoForm, length_cm: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="230"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largeur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={motoForm.width_cm}
                    onChange={(e) =>
                      setMotoForm({ ...motoForm, width_cm: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hauteur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={motoForm.height_cm}
                    onChange={(e) =>
                      setMotoForm({ ...motoForm, height_cm: e.target.value })
                    }
                    className="w-full border border-gray-300 px-3 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="140"
                  />
                </div>
              </div>

              {motoForm.length_cm && motoForm.width_cm && motoForm.height_cm && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600">Volume</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {calculateVolume()} m³
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={motoForm.notes}
                  onChange={(e) =>
                    setMotoForm({ ...motoForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Informations supplémentaires (poids, couleur, etc.)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={upsertMotorcycle}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading
                    ? "Traitement..."
                    : motoForm.id
                    ? "Mettre à jour"
                    : "Créer"}
                </button>
                {motoForm.id && (
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Motos existantes ({filteredMotorcycles.length})
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un modèle..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMotorcycles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Bike size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">
                    {searchTerm
                      ? "Aucune moto trouvée"
                      : "Aucune moto enregistrée"}
                  </p>
                  {!searchTerm && (
                    <p className="text-xs mt-2">
                      Utilisez le formulaire pour ajouter votre première moto
                    </p>
                  )}
                </div>
              )}

              {filteredMotorcycles.map((moto) => (
                <div
                  key={moto.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition group"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">
                      {moto.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {moto.length_cm} × {moto.width_cm} × {moto.height_cm} cm
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mt-1">
                      {(
                        (moto.length_cm * moto.width_cm * moto.height_cm) /
                        1000000
                      ).toFixed(4)}{" "}
                      m³
                    </div>
                    {moto.notes && (
                      <div className="text-xs text-gray-500 mt-2 italic">
                        {moto.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => editMotorcycle(moto)}
                      className="p-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="Éditer"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteMotorcycle(moto.id)}
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
            <li>• Les dimensions doivent être en centimètres (exemple: 230 cm)</li>
            <li>
              • Le volume est calculé automatiquement et converti en m³
            </li>
            <li>
              • Les motos enregistrées seront automatiquement reconnues lors de
              l'import des commandes
            </li>
            <li>
              • Le système match les noms de modèles (insensible à la casse)
            </li>
            <li>
              • Utilisez la barre de recherche pour trouver rapidement un modèle
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}