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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    phone: "",
    adress: ""
  });

  const openViewModal = (item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  const handleOpenCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setDeliveryInfo({
      phone: user.phone || "",
      adress: user.adress || ""
    });
    setIsCheckoutModalOpen(true);
  };

  if (user?.role !== "client") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] font-sans">
        <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4">Accès restreint</h2>
        <p className="font-serif italic text-xl text-gray-800 mb-8">Connectez-vous en tant que client pour accéder à votre panier.</p>
        <button 
          className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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

  const validerCommande = async () => {
    if (cartItems.length === 0) return;
    
    if (!deliveryInfo.phone || !deliveryInfo.adress) {
      alert("Veuillez remplir votre numéro de téléphone et votre adresse de livraison.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); 
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      for (const item of cartItems) {
        const commandeData = {
          produitId: item._id, 
          tailleChoisie: item.tailleChoisie || "Standard", 
          quantite: item.quantite || 1,
          adresseLivraison: deliveryInfo.adress,
          telephoneContact: deliveryInfo.phone
        };

        await axios.post("http://localhost:5000/api/orders/add", commandeData, config);
      }

      dispatch(clearCart());
      setIsCheckoutModalOpen(false); 
      navigate("/mes-commandes");

    } catch (error) {
      console.error("Erreur complète :", error);
      if (error.response && error.response.status === 404) {
         alert("Désolé, l'article que vous essayez de commander a été supprimé ou n'est plus disponible.");
      } else {
         alert("Une erreur est survenue lors de la validation.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-[#e6ff00] p-8 md:p-10 mb-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0 mb-4 text-black">Mon Panier</h2>
          <p className="font-serif italic text-xl text-gray-800 m-0">Revoyez vos articles avant de finaliser la commande.</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <h4 className="text-2xl font-black uppercase mb-4 text-black tracking-widest">Panier vide</h4>
            <p className="font-serif italic text-gray-600 font-bold mb-8">Découvrez nos dernières créations et trouvez la pièce parfaite.</p>
            <button 
              className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => navigate("/catalogue")}
            >
              Découvrir le catalogue
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="flex-1 bg-white p-6 md:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <ul className="flex flex-col">
                {cartItems.map((item, index) => (
                  <li key={`${item._id}-${index}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b-4 border-black last:border-0 last:pb-0 first:pt-0">
                    
                    <div className="flex gap-6 items-center w-full sm:w-auto mb-6 sm:mb-0">
                      <img 
                        src={item.image || "https://via.placeholder.com/100"} 
                        alt={item.titre} 
                        className="w-24 h-28 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}
                      />

                      <div className="flex flex-col">
                        <h4 
                          className="font-black text-xl uppercase tracking-wider mb-3 text-black cursor-pointer hover:text-white hover:bg-black p-1 transition-colors line-clamp-1 inline-block" 
                          onClick={() => navigate("/catalogue", { state: { scrollTo: item._id} })}
                        >
                          {item.titre}
                        </h4>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <label className="font-black uppercase tracking-widest text-xs text-gray-500">Taille</label>
                          <select 
                            value={item.tailleChoisie} 
                            onChange={(e) => handleSizeChange(index, e.target.value)}
                            className="bg-white border-2 border-black text-black font-bold uppercase p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#e6ff00]"
                          >
                            {item.taillesDisponibles && item.taillesDisponibles.map(taille => (
                              <option key={taille} value={taille}>{taille}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="font-black uppercase tracking-widest text-xs text-gray-500">Qté</label>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleQuantityChange(index, (item.quantite || 1) - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black font-black hover:bg-[#e6ff00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-lg font-black text-black">
                              {item.quantite || 1}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(index, (item.quantite || 1) + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black font-black hover:bg-[#e6ff00] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4">
                      <div className="font-black text-2xl bg-[#e6ff00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {item.prix * (item.quantite || 1)} TND
                      </div>
                      <button 
                        onClick={() => openViewModal(item)}
                        className="px-4 py-2 bg-black text-white font-black uppercase text-xs border-2 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Détails
                      </button>
                    </div>

                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-[350px]">
              <div className="bg-white p-6 md:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-32">
                <h3 className="text-2xl font-black uppercase tracking-widest text-black mb-6 border-b-4 border-black pb-4">Résumé</h3>
                
                <div className="flex justify-between items-center mb-4 font-bold uppercase tracking-wider text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-black text-black text-lg">{montantTotal} TND</span>
                </div>
                
                <div className="flex justify-between items-center mb-6 font-bold uppercase tracking-wider text-sm text-gray-600">
                  <span>Livraison</span>
                  <span className="font-black text-black text-lg bg-[#e6ff00] px-2 border-2 border-black">Offerte</span>
                </div>
                
                <div className="flex justify-between items-center border-t-4 border-black pt-6 mb-8 text-xl">
                  <span className="font-black uppercase text-black">Total à payer</span>
                  <span className="font-black bg-[#e6ff00] px-2 py-1 border-2 border-black">{montantTotal} TND</span>
                </div>
                
                <button 
                  className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  onClick={handleOpenCheckout}
                >
                  Passer la commande
                </button>
              </div>
            </div>

          </div>
        )}

        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 md:p-10 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-4 -right-4 bg-[#e6ff00] border-4 border-black text-black w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
              >
                ✕
              </button>
              
              <img 
                src={selectedProduct.image || "https://via.placeholder.com/300"} 
                alt={selectedProduct.titre} 
                className="w-full h-72 object-cover border-4 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
              />
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{selectedProduct.titre}</h3>
              
              <div className="inline-block bg-[#e6ff00] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                <p className="text-2xl font-black m-0">{selectedProduct.prix} TND</p>
              </div>
              
              {selectedProduct.description && (
                <p className="font-serif text-lg leading-relaxed mb-8 border-l-4 border-black pl-4">
                  {selectedProduct.description}
                </p>
              )}
              
              <div className="bg-gray-100 p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 text-sm font-bold uppercase tracking-wider text-black">
                <p className="flex justify-between border-b-2 border-gray-300 pb-2">
                  <span className="text-gray-600">Taille sélectionnée</span> 
                  <span className="font-black">{selectedProduct.tailleChoisie}</span>
                </p>
                <p className="flex justify-between pt-1">
                  <span className="text-gray-600">Quantité dans le panier</span> 
                  <span className="font-black">{selectedProduct.quantite || 1}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 md:p-10 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative">
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">Livraison</h3>
              
              <div className="mb-6">
                <label className="block font-black uppercase tracking-widest text-sm mb-2 text-black">
                  Téléphone
                </label>
                <input 
                  type="text" 
                  value={deliveryInfo.phone} 
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  placeholder="Ex: 55 123 456"
                  className="w-full p-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:bg-[#e6ff00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="mb-10">
                <label className="block font-black uppercase tracking-widest text-sm mb-2 text-black">
                  Adresse complète
                </label>
                <textarea 
                  value={deliveryInfo.adress} 
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, adress: e.target.value })}
                  placeholder="Votre adresse de livraison"
                  rows="3"
                  className="w-full p-4 bg-white border-4 border-black text-black font-bold focus:outline-none focus:bg-[#e6ff00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-gray-200 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Annuler
                </button>
                <button 
                  onClick={validerCommande}
                  className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Confirmer
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