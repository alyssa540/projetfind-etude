import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function MesCommandes() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État pour gérer quels groupes (commandes) sont ouverts
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // --- ÉTAT DU MODAL DE DÉTAILS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openViewModal = (item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };
  // ------------------------------------------

  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: token },
        });
        
        const rawOrders = res.data.orders || [];

        // --- NOUVELLE LOGIQUE DE REGROUPEMENT ---
        // On regroupe par date/heure ET par styliste !
        const groups = {};
        
        rawOrders.forEach(order => {
          const dateObj = new Date(order.createdAt);
          const dateStr = dateObj.toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' });
          const timeStr = `${dateObj.getHours()}h${String(dateObj.getMinutes()).padStart(2, '0')}`;
          
          // Récupération des infos du styliste
          const stylisteInfo = order.stylisteId || order.produitId?.stylisteId || {};
          const stylisteId = stylisteInfo._id || stylisteInfo || "inconnu";
          const stylisteName = stylisteInfo.name 
            ? `${stylisteInfo.name} ${stylisteInfo.lastname || ''}`.trim() 
            : null;

          // La clé contient maintenant l'ID du styliste pour bien les séparer
          const groupKey = `${dateStr}_${timeStr}_${stylisteId}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              id: groupKey,
              dateObj: dateObj, 
              displayDate: `${dateStr} à ${timeStr}`,
              stylisteName: stylisteName, 
              items: [],
              totalPrice: 0,
              statutGlobal: order.statut 
            };
          }

          groups[groupKey].items.push(order);
          const prixUnitaire = order.produitId?.prix || 0;
          groups[groupKey].totalPrice += prixUnitaire * (order.quantite || 1);
        });

        // On convertit l'objet en tableau et on trie du plus récent au plus ancien
        const sortedGroups = Object.values(groups).sort((a, b) => b.dateObj - a.dateObj);
        
        setGroupedOrders(sortedGroups);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération de mes commandes :", error);
        setLoading(false);
      }
    };

    if (user?.role === "client") {
      fetchMyOrders();
    }
  }, [user]);

  // Fonction pour basculer l'ouverture/fermeture d'une commande
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId] 
    }));
  };

  // --- FONCTION POUR ANNULER UNE COMMANDE ---
  const handleCancelOrder = async (items) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      try {
        const token = localStorage.getItem("token");
        // On boucle sur tous les articles de ce groupe pour les annuler dans la base de données
        await Promise.all(items.map(item => 
          axios.put(`http://localhost:5000/api/orders/${item._id}/cancel`, {}, {
            headers: { Authorization: token }
          })
        ));
        
        alert("Commande annulée avec succès !");
        // On recharge la page pour mettre à jour l'affichage
        window.location.reload(); 
        
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.msg || "Erreur lors de l'annulation de la commande.");
      }
    }
  };

  if (user?.role !== "client") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-2xl font-bold mb-2">Accès réservé aux clients.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-xl font-semibold animate-pulse">Chargement de votre historique...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-28 pb-12 px-5 font-sans text-[#3b332b] relative">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-3xl font-semibold mb-2 text-[#3b332b]">Mes Commandes</h2>
        <p className="text-center text-[#8c7e71] mb-10">
          Retrouvez ici l'historique de vos achats. Cliquez sur une commande pour en voir les détails.
        </p>

        {groupedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#ece5dd] border-dashed rounded-xl shadow-sm flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-6 text-[#4a4036]">Vous n'avez pas encore passé de commande.</h4>
            <Link 
              to="/catalogue" 
              className="px-6 py-3 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors shadow-sm"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedOrders.map((group) => {
              const isExpanded = expandedGroups[group.id];
              
              // Détermination des styles de statut
              let statusClasses = "text-amber-700 bg-amber-100"; 
              let statusText = "En attente";

              if (group.statutGlobal === "confirmee" || group.statutGlobal === "En cours de livraison") {
                statusClasses = "text-blue-700 bg-blue-100";
                statusText = "En préparation";
              }
              if (group.statutGlobal === "expediee" || group.statutGlobal === "Validée") {
                statusClasses = "text-emerald-700 bg-emerald-100";
                statusText = "Expédiée";
              }
              if (group.statutGlobal === "declinee" || group.statutGlobal === "Refusée") {
                statusClasses = "text-red-700 bg-red-100";
                statusText = "Refusée ✗";
              }
              if (group.statutGlobal === "Annulée" || group.statutGlobal === "annulee") {
                statusClasses = "text-gray-700 bg-gray-100";
                statusText = "Annulée";
              }

              return (
                <div key={group.id} className="border border-[#ece5dd] rounded-xl bg-white shadow-sm overflow-hidden transition-all">
                  
                  {/* --- EN-TÊTE DE LA COMMANDE (Cliquable) --- */}
                  <div 
                    onClick={() => toggleGroup(group.id)}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-[#fcfcfc] hover:bg-[#fdfaf6] cursor-pointer transition-colors ${isExpanded ? 'border-b border-[#ece5dd]' : ''}`}
                  >
                    <div className="mb-3 sm:mb-0">
                      <h4 className="text-lg font-semibold text-[#3b332b] mb-1">
                        Commande du {group.displayDate}
                      </h4>
                      {group.stylisteName && (
                        <div className="text-sm font-semibold text-[#cba88c] mb-1">
                          Chez : {group.stylisteName}
                        </div>
                      )}
                      <span className="text-sm text-[#8c7e71]">
                        {group.items.length} article(s) • Total : <strong className="text-[#3b332b]">{group.totalPrice} TND</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusClasses}`}>
                        {statusText}
                      </span>
                      <span className="text-[#8c7e71] text-lg w-5 text-center transition-transform">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* --- DÉTAIL DES ARTICLES ET BOUTON ANNULER --- */}
                  {isExpanded && (
                    <div className="p-5 bg-white">
                      {group.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center py-4 border-b border-[#ece5dd] last:border-0">
                          <div className="flex items-center gap-4">
                            {item.produitId?.image ? (
                              <img 
                                src={item.produitId.image} 
                                alt={item.produitId.titre || "Produit"} 
                                className="w-16 h-16 object-cover rounded-md border border-[#ece5dd]"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-[#f4ece2] rounded-md border border-[#ece5dd] flex items-center justify-center text-xs text-[#8c7e71]">Img</div>
                            )}
                            
                            <div>
                              <p className="font-semibold text-[#3b332b] mb-1">
                                {item.produitId?.titre || "Produit supprimé"}
                              </p>
                              <p className="text-sm text-[#8c7e71]">
                                Taille : {item.tailleChoisie} <span className="mx-1">|</span> Qté : {item.quantite || 1}
                              </p>
                            </div>
                          </div>
                          
                          {/* --- PRIX ET BOUTON VOIR --- */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="font-bold text-[#3b332b]">
                              {(item.produitId?.prix || 0) * (item.quantite || 1)} TND
                            </div>
                            {item.produitId && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  openViewModal(item); 
                                }}
                                className="text-[#8c7e71] hover:text-[#cba88c] transition-colors text-xl p-1"
                                title="Voir les détails du produit"
                              >
                                👁️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Condition pour le bouton annuler */}
                      {group.statutGlobal && group.statutGlobal.toLowerCase().includes("attente") && (
                        <div className="flex justify-end mt-4 pt-4 border-t border-dashed border-[#ece5dd]">
                          <button 
                            onClick={() => handleCancelOrder(group.items)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors shadow-sm"
                          >
                            Annuler cette commande
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        )}

        {/* --- MODAL DE DÉTAILS DU PRODUIT --- */}
        {isModalOpen && selectedProduct && selectedProduct.produitId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-xl max-w-lg w-full relative shadow-2xl animate-fade-in-up">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-[#8c7e71] hover:text-[#3b332b] text-2xl leading-none"
              >
                ✕
              </button>
              
              {selectedProduct.produitId.image ? (
                <img 
                  src={selectedProduct.produitId.image} 
                  alt={selectedProduct.produitId.titre} 
                  className="w-full h-64 object-cover rounded-lg mb-5 border border-[#ece5dd]" 
                />
              ) : (
                <div className="w-full h-64 bg-[#f4ece2] rounded-lg mb-5 flex items-center justify-center text-[#8c7e71] border border-[#ece5dd]">Image non disponible</div>
              )}
              
              <h3 className="text-2xl font-bold text-[#3b332b] mb-1">{selectedProduct.produitId.titre}</h3>
              <p className="text-xl font-bold text-[#cba88c] mb-4">{selectedProduct.produitId.prix} TND</p>
              
              {selectedProduct.produitId.description && (
                <p className="text-[#8c7e71] leading-relaxed mb-6 text-sm">
                  {selectedProduct.produitId.description}
                </p>
              )}
              
              <div className="bg-[#fdfaf6] p-5 rounded-lg border border-[#ece5dd]">
                <h4 className="font-semibold text-[#4a4036] mb-3">Détails de l'achat</h4>
                <div className="space-y-2 text-sm text-[#4a4036]">
                  <p className="flex justify-between border-b border-[#ece5dd] pb-1">
                    <span className="text-[#8c7e71]">Taille commandée:</span> 
                    <span className="font-semibold">{selectedProduct.tailleChoisie}</span>
                  </p>
                  <p className="flex justify-between border-b border-[#ece5dd] pb-1">
                    <span className="text-[#8c7e71]">Quantité:</span> 
                    <span className="font-semibold">{selectedProduct.quantite || 1}</span>
                  </p>
                  <p className="flex justify-between pt-1">
                    <span className="text-[#8c7e71]">Sous-total:</span> 
                    <span className="font-bold text-[#3b332b]">{(selectedProduct.produitId.prix || 0) * (selectedProduct.quantite || 1)} TND</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MesCommandes;