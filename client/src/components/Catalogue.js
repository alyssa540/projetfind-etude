import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux"; 
import { addToCart } from "../JS/cartSlice/cartSlice"; 
import { useLocation } from "react-router-dom";

// --- SOUS-COMPOSANT PRODUCT CARD ---
// On isole chaque carte pour gérer ses propres sélections (taille et quantité)
const ProductCard = ({ product, user }) => {
  const dispatch = useDispatch();
  
  // États locaux spécifiques à ce produit
  const [selectedSize, setSelectedSize] = useState(
    product.taillesDisponibles && product.taillesDisponibles.length > 0 
      ? product.taillesDisponibles[0] 
      : "Standard"
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    // On envoie à Redux le produit, la taille sélectionnée ET la quantité
    dispatch(addToCart({ 
      produit: product, 
      taille: selectedSize, 
      quantite: selectedQuantity 
    }));
    alert(`Ajouté au panier ! (${selectedQuantity}x taille ${selectedSize})`);
    
    // Optionnel : réinitialiser la quantité après ajout
    setSelectedQuantity(1);
  };

  return (
    <div id={product._id} className="product-card">
      <img 
        src={product.image || "https://via.placeholder.com/300"} 
        alt={product.titre}
        className="product-image"
      />
      
      <div className="product-info">
        <h3 className="product-title">{product.titre}</h3>
        <p className="product-description">{product.description}</p>
        
        {/* --- NOUVEAUX CONTRÔLES (Uniquement pour les clients) --- */}
        {user?.role === "client" && (
          <div className="product-controls" style={{ margin: "10px 0", display: "flex", gap: "15px", alignItems: "center" }}>
            
            {/* Sélection de la taille */}
            {product.taillesDisponibles && product.taillesDisponibles.length > 0 && (
              <div>
                <label style={{ fontSize: "0.9em", marginRight: "5px" }}>Taille :</label>
                <select 
                  value={selectedSize} 
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  {product.taillesDisponibles.map(taille => (
                    <option key={taille} value={taille}>{taille}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sélection de la quantité */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <label style={{ fontSize: "0.9em", marginRight: "5px" }}>Qté :</label>
              <button 
                onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                style={{ padding: "2px 8px", cursor: "pointer" }}
              >-</button>
              <span style={{ margin: "0 10px", fontWeight: "bold" }}>{selectedQuantity}</span>
              <button 
                onClick={() => setSelectedQuantity(prev => prev + 1)}
                style={{ padding: "2px 8px", cursor: "pointer" }}
              >+</button>
            </div>
          </div>
        )}

        <div className="product-bottom">
          <span className="product-price">{product.prix} TND</span>
          
          {user?.role === "client" && (
            <button 
              className="btn-details" 
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL CATALOGUE ---
function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state) => state.user?.user);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo && products.length > 0) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [products, location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all");
        setProducts(res.data.products);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du catalogue :", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Chargement... </h2>;
  }

  return (
    <div>
      <h2 style={{ textAlign: "center", margin: "30px 0", marginRight:"422px" }}>Notre Catalogue</h2>
      
      {products.length === 0 ? (
        <h4 style={{ textAlign: "center" }}>Aucune création disponible.</h4>
      ) : (
        <div className="catalog-container">
          {products.map((product) => (
            // Utilisation de notre nouveau sous-composant
            <ProductCard key={product._id} product={product} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalogue;