import React, { useState } from "react"; // Ajout de useState ici
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// Assurez-vous d'avoir ces actions dans votre cartSlice.js
import { clearCart, updateItemQuantity, updateItemSize, removeItem } from "../JS/cartSlice/cartSlice"; 
import axios from "axios";

function Panier() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const montantTotal = useSelector((state) => state.cart.montantTotal);
  const user = useSelector((state) => state.user?.user);

  // --- NOUVEAU : ETAT DU MODAL DE DETAILS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openViewModal = (item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };
  // ------------------------------------------

  if (user?.role !== "client") {
    return (
      <div className="cart-access-denied">
        <h2>Accès restreint</h2>
        <p>Connectez-vous en tant que client pour accéder à votre panier.</p>
        <button className="btn-premium btn-outline" onClick={() => navigate("/login")}>
          Se connecter
        </button>
      </div>
    );
  }

  // --- NOUVELLES FONCTIONS DE GESTION ---
  
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) {
      dispatch(removeItem(index)); 
      return;
    }
    dispatch(updateItemQuantity({ index, quantite: newQuantity }));
  };

  const handleSizeChange = (index, newSize) => {
    dispatch(updateItemSize({ index, tailleChoisie: newSize }));
  };

  // --------------------------------------

  const validerCommande = async () => {
    if (cartItems.length === 0) return;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token"); 
      const config = {
        headers: {
          Authorization: token 
        }
      };

      for (const item of cartItems) {
        const commandeData = {
          produitId: item._id, 
          tailleChoisie: item.tailleChoisie || "Standard", 
          quantite: item.quantite || 1 
        };

        await axios.post("http://localhost:5000/api/orders/add", commandeData, config);
      }

      dispatch(clearCart());
      navigate("/mes-commandes");

    } catch (error) {
      console.error("Erreur complète :", error);
    }
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-header">
        <h2 className="cart-title">Mon Panier</h2>
        <p className="cart-subtitle">Revoyez vos articles avant de finaliser la commande.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <h4>Votre panier est désespérément vide.</h4>
          <p>Découvrez nos dernières créations et trouvez la pièce parfaite.</p>
          <button className="btn-premium" onClick={() => navigate("/catalogue")}>
            Découvrir le catalogue
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-container">
            <ul className="cart-items-list">
              {cartItems.map((item, index) => (
                <li key={`${item._id}-${index}`} className="cart-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                  
                  {/* Conteneur pour l'image et le texte (flexbox pour les aligner) */}
                  <div className="item-details" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    
                    {/* --- L'IMAGE DU PRODUIT --- */}
                    <img 
                      src={item.image || "https://via.placeholder.com/80"} 
                      alt={item.titre} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}
                      className="cursor-pointer" // Optionnel si vous avez une classe pour le curseur
                    />

                    <div className="item-text">
                      <h4 className="item-title" style={{ cursor: 'pointer', margin: '0 0 10px 0' }} onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}>
                        {item.titre}
                      </h4>
                      
                      {/* --- SÉLECTEUR DE TAILLE --- */}
                      <div className="item-size-selector">
                        <label>Taille : </label>
                        <select 
                          value={item.tailleChoisie} 
                          onChange={(e) => handleSizeChange(index, e.target.value)}
                          style={{ marginLeft: '5px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          {item.taillesDisponibles && item.taillesDisponibles.map(taille => (
                            <option key={taille} value={taille}>{taille}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* --- SÉLECTEUR DE QUANTITÉ --- */}
                      <div className="item-quantity-selector" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Quantité : </label>
                        <button style={{ padding: '2px 8px', cursor: 'pointer' }} onClick={() => handleQuantityChange(index, (item.quantite || 1) - 1)}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{item.quantite || 1}</span>
                        <button style={{ padding: '2px 8px', cursor: 'pointer' }} onClick={() => handleQuantityChange(index, (item.quantite || 1) + 1)}>+</button>
                      </div>

                    </div>
                  </div>
                  
                  {/* --- PRIX ET BOUTON VOIR (Modifié ici) --- */}
                  <div className="item-price-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div className="item-price" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      {item.prix * (item.quantite || 1)} TND
                    </div>
                    <button 
                      onClick={() => openViewModal(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5em' }}
                      title="Voir les détails"
                    >
                      👁️
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          </div>

          <div className="cart-summary-container">
            <div className="cart-summary">
              <h3>Résumé de la commande</h3>
              <div className="summary-line">
                <span>Sous-total</span>
                <span>{montantTotal} TND</span>
              </div>
              <div className="summary-line">
                <span>Livraison</span>
                <span>Offerte</span>
              </div>
              <div className="summary-total" style={{ borderTop: '2px solid #333', marginTop: '15px', paddingTop: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total à payer</span>
                <span>{montantTotal} TND</span>
              </div>
              
              <button className="btn-premium btn-block" style={{ marginTop: '20px' }} onClick={validerCommande}>
                Finaliser la commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOUVEAU : MODAL DE DÉTAILS DU PRODUIT --- */}
      {isModalOpen && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#333' }}
            >
              ✕
            </button>
            
            <img 
              src={selectedProduct.image || "https://via.placeholder.com/300"} 
              alt={selectedProduct.titre} 
              style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
            />
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>{selectedProduct.titre}</h3>
            <p style={{ fontWeight: 'bold', color: '#8c735f', fontSize: '1.2em' }}>{selectedProduct.prix} TND</p>
            
            {/* On affiche la description si elle existe dans le store Redux */}
            {selectedProduct.description && (
              <p style={{ marginTop: '15px', color: '#555', lineHeight: '1.5' }}>{selectedProduct.description}</p>
            )}
            
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Taille sélectionnée:</strong> {selectedProduct.tailleChoisie}</p>
              <p style={{ margin: '0' }}><strong>Quantité dans le panier:</strong> {selectedProduct.quantite || 1}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Panier;