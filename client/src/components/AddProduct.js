import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProduct() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [mesCreations, setMesCreations] = useState([]);
  
  // Nouveaux states pour gérer le modal de modification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (user && user.role === 'styliste') {
      const fetchMesCreations = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/products/all");
          const mesProduits = res.data.products.filter((product) => {
            const idCreateurDuProduit = product.stylisteId?._id || product.stylisteId;
            return String(idCreateurDuProduit) === String(user._id);
          });
          setMesCreations(mesProduits);
        } catch (error) {
          console.error("Erreur lors de la récupération des créations :", error);
        }
      };
      fetchMesCreations();
    }
  }, [user]);

  const [product, setProduct] = useState({
    titre: "",
    description: "",
    prix: "",
    image: "",
    taillesDisponibles: [],
  });

  const handleSizeChange = (e, isEditing = false) => {
    const taille = e.target.value;
    const isChecked = e.target.checked;

    if (isEditing) {
      if (isChecked) {
        setEditingProduct({ ...editingProduct, taillesDisponibles: [...editingProduct.taillesDisponibles, taille] });
      } else {
        setEditingProduct({
          ...editingProduct,
          taillesDisponibles: editingProduct.taillesDisponibles.filter((t) => t !== taille),
        });
      }
    } else {
      if (isChecked) {
        setProduct({ ...product, taillesDisponibles: [...product.taillesDisponibles, taille] });
      } else {
        setProduct({
          ...product,
          taillesDisponibles: product.taillesDisponibles.filter((t) => t !== taille),
        });
      }
    }
  };

  // --- LOGIQUE D'AJOUT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/products/add",
        product,
        { headers: { Authorization: token } }
      );
      alert("Création ajoutée avec succès ! 🎉");
      // Ajout du nouveau produit directement dans l'état pour mettre à jour l'affichage
      setMesCreations([...mesCreations, res.data.product]);
      // Réinitialiser le formulaire (optionnel, selon ce que vous préférez)
      setProduct({ titre: "", description: "", prix: "", image: "", taillesDisponibles: [] });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout de la création.");
    }
  };

  // --- LOGIQUE DE SUPPRESSION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette création ?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: token },
      });
      // Retirer le produit supprimé de l'affichage
      setMesCreations(mesCreations.filter((creation) => creation._id !== id));
      alert("Création supprimée ! 🗑️");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

  // --- LOGIQUE DE MODIFICATION ---
  const openEditModal = (creation) => {
    setEditingProduct(creation);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        editingProduct,
        { headers: { Authorization: token } } // Toujours envoyer le token si besoin
      );
      
      // Mettre à jour la liste affichée avec les nouvelles données
      setMesCreations(mesCreations.map((c) => (c._id === editingProduct._id ? res.data.product : c)));
      setIsModalOpen(false);
      setEditingProduct(null);
      alert("Création modifiée avec succès ! ✨");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification.");
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div className="access-denied">
        <h2>Accès refusé.</h2>
        <p>Espace réservé aux créateurs.</p>
      </div>
    );
  }

  return (
    <div className="add-product-wrapper flex flex-col items-center space-y-8 relative">
      
      {/* FORMULAIRE D'AJOUT */}
      <form onSubmit={handleSubmit} className="add-product-form">
        <h2 className="add-product-title">Nouvelle Création</h2>
        <p className="add-product-subtitle">Ajoutez les détails de votre nouvelle pièce</p>

        <div className="form-group">
          <input
            type="text"
            className="input-premium"
            placeholder="Nom de la création (ex: Robe en Lin)"
            required
            value={product.titre}
            onChange={(e) => setProduct({ ...product, titre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <textarea
            className="input-premium textarea-premium"
            placeholder="Description détaillée du vêtement..."
            required
            rows="3"
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <input
              type="number"
              className="input-premium"
              placeholder="Prix (TND)"
              required
              value={product.prix}
              onChange={(e) => setProduct({ ...product, prix: e.target.value })}
            />
          </div>

          <div className="form-group half-width">
            <input
              type="text"
              className="input-premium"
              placeholder="URL de l'image"
              value={product.image}
              onChange={(e) => setProduct({ ...product, image: e.target.value })}
            />
          </div>
        </div>

        <div className="sizes-section">
          <label className="sizes-label">Tailles disponibles</label>
          <div className="sizes-grid">
            {["XS", "S", "M", "L", "XL"].map((taille) => (
              <label key={taille} className="size-checkbox-label">
                <input 
                  type="checkbox" 
                  value={taille} 
                  onChange={(e) => handleSizeChange(e, false)} 
                  className="hidden-checkbox"
                />
                <span className="size-badge">{taille}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn-submit-premium" type="submit">
          Publier ma création
        </button>
      </form>

      {/* PORTFOLIO (AVEC BOUTONS EDIT/DELETE) */}
      {user.role === "styliste" && (
        <div className="mes-creations-wrapper w-full max-w-4xl mt-8">
          <h3 className="mes-creations-title text-2xl font-bold mb-4">Mon Portfolio</h3>
          
          {mesCreations.length === 0 ? (
            <p style={{ color: "#8c735f" }}>Vous n'avez pas encore ajouté de créations.</p>
          ) : (
            <div className="creations-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {mesCreations.map((creation) => (
                <div key={creation._id} className="creation-mini-card border p-4 rounded-lg shadow-sm flex flex-col">
                  <img src={creation.image} alt={creation.titre} className="creation-img w-full h-48 object-cover rounded-md mb-4" />
                  <div className="creation-info flex-grow">
                    <h4 className="font-semibold text-lg">{creation.titre}</h4>
                    <p className="text-gray-600">{creation.prix} TND</p>
                  </div>
                  
                  {/* BOUTONS D'ACTION */}
                  <div className="creation-actions flex justify-between mt-4 border-t pt-2">
                    <button 
                      onClick={() => openEditModal(creation)} 
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                       Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(creation._id)} 
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE MODIFICATION */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Modifier la Création</h2>
            
            <form onSubmit={handleUpdate} className="flex flex-col space-y-4">
              <input
                type="text"
                className="input-premium border p-2 rounded"
                value={editingProduct.titre}
                onChange={(e) => setEditingProduct({ ...editingProduct, titre: e.target.value })}
                required
              />
              <textarea
                className="input-premium textarea-premium border p-2 rounded"
                rows="3"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                required
              />
              <input
                type="number"
                className="input-premium border p-2 rounded"
                value={editingProduct.prix}
                onChange={(e) => setEditingProduct({ ...editingProduct, prix: e.target.value })}
                required
              />
              <input
                type="text"
                className="input-premium border p-2 rounded"
                value={editingProduct.image}
                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
              />
              
              <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-4" type="submit">
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddProduct;