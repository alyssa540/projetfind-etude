import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProduct() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  
  const [product, setProduct] = useState({
    titre: "",
    description: "",
    prix: "", // Mieux vaut l'initialiser vide pour le placeholder
    image: "", 
    taillesDisponibles: [], 
  });

  const handleSizeChange = (e) => {
    const taille = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setProduct({ ...product, taillesDisponibles: [...product.taillesDisponibles, taille] });
    } else {
      setProduct({
        ...product,
        taillesDisponibles: product.taillesDisponibles.filter((t) => t !== taille),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); 
      await axios.post(
        "http://localhost:5000/api/products/add", 
        product,
        {
          headers: { Authorization: token },
        }
      );
      alert("Création ajoutée avec succès ! 🎉");
      navigate("/catalogue");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout de la création.");
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
    <div className="add-product-wrapper">
      <form onSubmit={handleSubmit} className="add-product-form">
        <h2 className="add-product-title">Nouvelle Création</h2>
        <p className="add-product-subtitle">Ajoutez les détails de votre nouvelle pièce</p>

        <div className="form-group">
          <input
            type="text"
            className="input-premium"
            placeholder="Nom de la création (ex: Robe en Lin)"
            required
            onChange={(e) => setProduct({ ...product, titre: e.target.value })}
          />
        </div>

        <div className="form-group">
          <textarea
            className="input-premium textarea-premium"
            placeholder="Description détaillée du vêtement..."
            required
            rows="3"
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
              onChange={(e) => setProduct({ ...product, prix: e.target.value })}
            />
          </div>

          <div className="form-group half-width">
            <input
              type="text"
              className="input-premium"
              placeholder="URL de l'image"
              onChange={(e) => setProduct({ ...product, image: e.target.value })}
            />
          </div>
        </div>

        {/* Section pour choisir les tailles (Style Premium) */}
        <div className="sizes-section">
          <label className="sizes-label">Tailles disponibles</label>
          <div className="sizes-grid">
            {["XS", "S", "M", "L", "XL"].map((taille) => (
              <label key={taille} className="size-checkbox-label">
                <input 
                  type="checkbox" 
                  value={taille} 
                  onChange={handleSizeChange} 
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
    </div>
  );
}

export default AddProduct;