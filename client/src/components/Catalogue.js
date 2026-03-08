import React, { useState, useEffect } from "react";
import axios from "axios";
// 1. On importe useDispatch en plus de useSelector
import { useSelector, useDispatch } from "react-redux"; 
// 2. On importe LE MESSAGE (l'action) depuis ton dossier JS
import { addToCart } from "../JS/cartSlice/cartSlice"; 

// N'oublie pas d'importer le fichier CSS ici ! 🎨
import { useLocation } from "react-router-dom";


function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 3. On initialise LE FACTEUR
  const dispatch = useDispatch(); 

  const user = useSelector((state) => state.user?.user);
  const location = useLocation();
  useEffect(() => {
    // Si on a reçu l'ordre de scroller ET que les produits sont bien chargés
    if (location.state?.scrollTo && products.length > 0) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        // Ça glisse doucement vers le vêtement !
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
        /* ICI : On remplace le simple <div> par notre conteneur CSS */
        <div className="catalog-container">
          
          {products.map((product) => (
            /* La carte de chaque produit */
            <div key={product._id} id={product._id} className="product-card">
              
              <img 
                src={product.image || "https://via.placeholder.com/300"} 
                alt={product.titre}
                className="product-image"
              />
              
              <div className="product-info">
                <h3 className="product-title">{product.titre}</h3>
                <p className="product-description">{product.description}</p>
                
               {/* On regroupe le prix et le bouton magique en bas de la carte */}
                <div className="product-bottom">
                  <span className="product-price">{product.prix} €</span>
                  
                  {/* 4. LE BOUTON MAGIQUE (intact, avec le design CSS) */}
                  {user?.role === "client" && (
                    <button 
                      className="btn-details" 
                      onClick={() => {
                        // On choisit une taille par défaut (la première dispo)
                        const tailleChoisie = product.taillesDisponibles[0] || "Standard";
                        
                        // ON ENVOIE LE MESSAGE À REDUX ICI !
                        dispatch(addToCart({ produit: product, taille: tailleChoisie }));
                        
                        alert("Ajouté au panier ! ");
                      }}
                    >
                      Ajouter au panier
                    </button>
                  )}
                </div>
                
              </div>
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
}

export default Catalogue;