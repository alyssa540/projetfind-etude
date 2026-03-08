import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../JS/cartSlice/cartSlice"; 
import axios from "axios";

function Panier() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const montantTotal = useSelector((state) => state.cart.montantTotal);
  const user = useSelector((state) => state.user?.user);
  const items = useSelector((state) => state.cart.items); 

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

  const validerCommande = async () => {
    if (items.length === 0) {
      alert("Votre panier est vide ! ");
      return;
    }

    if (!user) {
      alert("Veuillez vous connecter pour finaliser la commande.");
      navigate("/login");
      return;
    }

    try {
      // 1. On récupère le token
      const token = localStorage.getItem("token"); 

      // 2. On configure l'autorisation (Essai avec le token direct)
      const config = {
        headers: {
          Authorization: token 
        }
      };

      // 3. On boucle sur chaque article du panier proprement
      for (const item of items) {
        const commandeData = {
          produitId: item._id, // L'ID du produit
          tailleChoisie: item.tailleChoisie || "Standard", // La taille 
        };

        // On attend que la commande soit envoyée avant de passer au produit suivant
        await axios.post("http://localhost:5000/api/orders/add", commandeData, config);
      }

      // 4. Si tout s'est bien passé :
      alert("Commande validée ! Les stylistes ont été notifiés. ✨");
      
      // On vide le panier
      dispatch(clearCart());

      // On renvoie le client vers son profil
      navigate("/profil");

    } catch (error) {
      console.error("Erreur complète :", error);
      alert("Erreur du backend : " + (error.response?.data?.msg || error.message));
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
                <li key={index} className="cart-item">
                  <div className="item-details">
                    
                    <div className="item-text">
                      <h4 className="item-title" onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}>{item.titre}</h4>
                      <p className="item-size">Taille : <strong>{item.tailleChoisie}</strong></p>
                    </div>
                  </div>
                  <div className="item-price">
                    {item.prix} TND
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
              <div className="summary-total">
                <span>Total à payer</span>
                <span>{montantTotal} TND</span>
              </div>
              
              <button className="btn-premium btn-block" onClick={validerCommande}>
                Finaliser la commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panier;