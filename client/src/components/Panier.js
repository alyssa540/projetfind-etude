import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart, updateItemQuantity, updateItemSize, removeItem } from "../JS/cartSlice/cartSlice"; 
import axios from "axios";

function Panier() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const montantTotal = useSelector((state) => state.cart.montantTotal);
  const user = useSelector((state) => state.user?.user);

  // --- ETAT DU MODAL DE DETAILS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- NOUVEAU : ETAT DU MODAL DE LIVRAISON ---
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    phone: "",
    adress: ""
  });

  const openViewModal = (item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  // --- NOUVEAU : OUVIR LE MODAL DE LIVRAISON ---
  const handleOpenCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // On pré-remplit avec les infos du profil s'il en a, sinon c'est vide
    setDeliveryInfo({
      phone: user.phone || "",
      adress: user.adress || ""
    });
    setIsCheckoutModalOpen(true);
  };

  if (user?.role !== "client") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-2xl font-bold mb-4">Accès restreint</h2>
        <p className="text-[#8c7e71] mb-6">Connectez-vous en tant que client pour accéder à votre panier.</p>
        <button 
          className="px-6 py-2.5 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors"
          onClick={() => navigate("/login")}
        >
          Se connecter
        </button>
      </div>
    );
  }
  
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

  // --- MODIFIÉ : LA FONCTION D'ENVOI AU BACKEND ---
  const validerCommande = async () => {
    if (cartItems.length === 0) return;
    
    // Petite vérification pour s'assurer qu'il a rempli les champs
    if (!deliveryInfo.phone || !deliveryInfo.adress) {
      alert("Veuillez remplir votre numéro de téléphone et votre adresse de livraison.");
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
          quantite: item.quantite || 1,
          // 👇 NOUVEAU : On envoie l'adresse et le tel au backend
          adresseLivraison: deliveryInfo.adress,
          telephoneContact: deliveryInfo.phone
        };

        await axios.post("http://localhost:5000/api/orders/add", commandeData, config);
      }

      dispatch(clearCart());
      setIsCheckoutModalOpen(false); // On ferme le modal
      navigate("/mes-commandes");

    } catch (error) {
      console.error("Erreur complète :", error);
      alert("Une erreur est survenue lors de la validation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-28 pb-12 px-5 font-sans text-[#3b332b]">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-[#3b332b] mb-2">Mon Panier</h2>
          <p className="text-[#8c7e71]">Revoyez vos articles avant de finaliser la commande.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#ece5dd] rounded-xl border-dashed shadow-sm flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-2 text-[#4a4036]">Votre panier est désespérément vide.</h4>
            <p className="text-[#8c7e71] mb-8">Découvrez nos dernières créations et trouvez la pièce parfaite.</p>
            <button 
              className="px-8 py-3 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors"
              onClick={() => navigate("/catalogue")}
            >
              Découvrir le catalogue
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- LISTE DES ARTICLES --- */}
            <div className="flex-1 bg-white p-6 md:p-8 rounded-xl border border-[#ece5dd] shadow-sm">
              <ul className="flex flex-col">
                {cartItems.map((item, index) => (
                  <li key={`${item._id}-${index}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-[#ece5dd] last:border-0 last:pb-0 first:pt-0">
                    
                    <div className="flex gap-4 items-center w-full sm:w-auto mb-4 sm:mb-0">
                      <img 
                        src={item.image || "https://via.placeholder.com/100"} 
                        alt={item.titre} 
                        className="w-20 h-24 object-cover rounded-md border border-[#ece5dd] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}
                      />

                      <div className="flex flex-col">
                        <h4 
                          className="font-semibold text-lg text-[#3b332b] cursor-pointer hover:text-[#cba88c] transition-colors mb-2 line-clamp-1" 
                          onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}
                        >
                          {item.titre}
                        </h4>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-sm text-[#8c7e71]">Taille :</label>
                          <select 
                            value={item.tailleChoisie} 
                            onChange={(e) => handleSizeChange(index, e.target.value)}
                            className="bg-[#fdfaf6] border border-[#ece5dd] text-sm text-[#4a4036] py-1 px-2 rounded focus:outline-none focus:border-[#cba88c]"
                          >
                            {item.taillesDisponibles && item.taillesDisponibles.map(taille => (
                              <option key={taille} value={taille}>{taille}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-[#8c7e71]">Quantité :</label>
                          <div className="flex items-center bg-[#fdfaf6] border border-[#ece5dd] rounded-md h-[30px]">
                            <button 
                              onClick={() => handleQuantityChange(index, (item.quantite || 1) - 1)}
                              className="px-2.5 text-[#8c7e71] hover:text-[#3b332b] transition-colors leading-none"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-[#3b332b]">
                              {item.quantite || 1}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(index, (item.quantite || 1) + 1)}
                              className="px-2.5 text-[#8c7e71] hover:text-[#3b332b] transition-colors leading-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="font-bold text-lg text-[#cba88c] sm:mb-4">
                        {item.prix * (item.quantite || 1)} TND
                      </div>
                      <button 
                        onClick={() => openViewModal(item)}
                        className="text-[#8c7e71] hover:text-[#3b332b] transition-colors text-xl p-2 bg-[#fdfaf6] rounded-full border border-transparent hover:border-[#ece5dd]"
                        title="Voir les détails"
                      >
                        👁️
                      </button>
                    </div>

                  </li>
                ))}
              </ul>
            </div>

            {/* --- RÉSUMÉ DE LA COMMANDE --- */}
            <div className="w-full lg:w-[350px]">
              <div className="bg-white p-6 md:p-8 rounded-xl border border-[#ece5dd] shadow-sm sticky top-28">
                <h3 className="text-xl font-semibold mb-6 text-[#3b332b]">Résumé</h3>
                
                <div className="flex justify-between items-center mb-4 text-[#8c7e71]">
                  <span>Sous-total</span>
                  <span className="font-semibold text-[#3b332b]">{montantTotal} TND</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 text-[#8c7e71]">
                  <span>Livraison</span>
                  <span className="font-semibold text-emerald-600">Offerte</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-[#ece5dd] pt-4 mb-8 text-lg">
                  <span className="font-semibold text-[#3b332b]">Total à payer</span>
                  <span className="font-bold text-[#cba88c]">{montantTotal} TND</span>
                </div>
                
                <button 
                  className="w-full py-3.5 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors shadow-sm" 
                  onClick={handleOpenCheckout}
                >
                  Passer la commande
                </button>
              </div>
            </div>

          </div>
        )}

        {/* --- MODAL DE DÉTAILS DU PRODUIT --- */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-xl max-w-lg w-full relative shadow-2xl animate-fade-in-up">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-[#8c7e71] hover:text-[#3b332b] text-2xl leading-none"
              >
                ✕
              </button>
              
              <img 
                src={selectedProduct.image || "https://via.placeholder.com/300"} 
                alt={selectedProduct.titre} 
                className="w-full h-64 object-cover rounded-lg mb-5 border border-[#ece5dd]" 
              />
              <h3 className="text-2xl font-bold text-[#3b332b] mb-1">{selectedProduct.titre}</h3>
              <p className="text-xl font-bold text-[#cba88c] mb-4">{selectedProduct.prix} TND</p>
              
              {selectedProduct.description && (
                <p className="text-[#8c7e71] leading-relaxed mb-6 text-sm">
                  {selectedProduct.description}
                </p>
              )}
              
              <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd] flex flex-col gap-2 text-sm text-[#4a4036]">
                <p className="flex justify-between">
                  <strong className="text-[#8c7e71] font-normal">Taille sélectionnée:</strong> 
                  <span className="font-semibold">{selectedProduct.tailleChoisie}</span>
                </p>
                <p className="flex justify-between">
                  <strong className="text-[#8c7e71] font-normal">Quantité dans le panier:</strong> 
                  <span className="font-semibold">{selectedProduct.quantite || 1}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL DE LIVRAISON (CHECKOUT) --- */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-xl max-w-md w-full relative shadow-2xl animate-fade-in-up border border-[#ece5dd]">
              <h3 className="text-2xl font-bold text-[#3b332b] mb-6">Détails de livraison</h3>
              
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#4a4036] mb-2">
                  Numéro de téléphone
                </label>
                <input 
                  type="text" 
                  value={deliveryInfo.phone} 
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  placeholder="Ex: 55 123 456"
                  className="w-full p-3 bg-[#fdfaf6] border border-[#ece5dd] text-[#3b332b] rounded-md focus:outline-none focus:border-[#cba88c] focus:ring-1 focus:ring-[#cba88c] transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#4a4036] mb-2">
                  Adresse complète
                </label>
                <textarea 
                  value={deliveryInfo.adress} 
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, adress: e.target.value })}
                  placeholder="Où souhaitez-vous être livré ?"
                  rows="3"
                  className="w-full p-3 bg-[#fdfaf6] border border-[#ece5dd] text-[#3b332b] rounded-md focus:outline-none focus:border-[#cba88c] focus:ring-1 focus:ring-[#cba88c] transition-all resize-y"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-5 py-2.5 rounded-md bg-[#f4ece2] text-[#3b332b] font-medium hover:bg-[#e3d5c5] transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={validerCommande}
                  className="px-5 py-2.5 rounded-md bg-[#3b332b] text-white font-medium hover:bg-[#2a241e] transition-colors shadow-sm"
                >
                  Confirmer l'achat
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Panier;