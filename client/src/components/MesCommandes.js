import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function MesCommandes() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openViewModal = (item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  };

  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawOrders = res.data.orders || [];
        const groups = {};
        
        rawOrders.forEach(order => {
          const dateObj = new Date(order.createdAt);
          const dateStr = dateObj.toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' });
          const timeStr = `${dateObj.getHours()}h${String(dateObj.getMinutes()).padStart(2, '0')}`;
          
          const stylisteInfo = order.stylisteId || order.produitId?.stylisteId || {};
          const stylisteId = stylisteInfo._id || stylisteInfo || "inconnu";
          const stylisteName = stylisteInfo.name 
            ? `${stylisteInfo.name} ${stylisteInfo.lastname || ''}`.trim() 
            : null;

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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId] 
    }));
  };

  const handleCancelOrder = async (items) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      try {
        const token = localStorage.getItem("token");
        await Promise.all(items.map(item => 
          axios.put(`http://localhost:5000/api/orders/${item._id}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
        
        alert("Commande annulée avec succès !");
        window.location.reload(); 
        
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.msg || "Erreur lors de l'annulation de la commande.");
      }
    }
  };

  if (user?.role !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] font-sans">
        <h2 className="text-3xl font-black uppercase tracking-widest text-black">Accès réservé</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] font-sans">
        <h2 className="text-3xl font-black uppercase tracking-widest text-black animate-pulse">Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#e6ff00] p-8 md:p-10 mb-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0 mb-4 text-black">Mes Commandes</h2>
          <p className="font-serif italic text-xl text-gray-800 m-0">
            Historique de vos achats. Cliquez pour explorer.
          </p>
        </div>

        {groupedOrders.length === 0 ? (
          <div className="text-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <h4 className="text-2xl font-black uppercase mb-8 text-black tracking-widest">Aucune commande</h4>
            <Link 
              to="/catalogue" 
              className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groupedOrders.map((group) => {
              const isExpanded = expandedGroups[group.id];
              
              let statusClasses = "bg-yellow-300 text-black"; 
              let statusText = "En attente";

              if (group.statutGlobal === "confirmee" || group.statutGlobal === "En cours de livraison") {
                statusClasses = "bg-blue-300 text-black";
                statusText = "En préparation";
              }
              if (group.statutGlobal === "expediee" || group.statutGlobal === "Validée") {
                statusClasses = "bg-green-400 text-black";
                statusText = "Expédiée";
              }
              if (group.statutGlobal === "declinee" || group.statutGlobal === "Refusée") {
                statusClasses = "bg-red-500 text-white";
                statusText = "Refusée ✗";
              }
              if (group.statutGlobal === "Annulée" || group.statutGlobal === "annulee") {
                statusClasses = "bg-gray-400 text-black";
                statusText = "Annulée";
              }

              return (
                <div key={group.id} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                  
                  <div 
                    onClick={() => toggleGroup(group.id)}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 cursor-pointer transition-colors hover:bg-[#e6ff00] ${isExpanded ? 'border-b-4 border-black bg-[#e6ff00]' : 'bg-white'}`}
                  >
                    <div className="mb-4 sm:mb-0">
                      <h4 className="text-xl md:text-2xl font-black uppercase tracking-widest text-black mb-2">
                        {group.displayDate}
                      </h4>
                      {group.stylisteName && (
                        <div className="text-lg font-serif italic text-gray-800 mb-2 font-bold">
                          Chez {group.stylisteName}
                        </div>
                      )}
                      <span className="text-sm font-bold uppercase tracking-widest text-gray-600 block mt-2">
                        {group.items.length} Article(s) <span className="mx-2 text-black text-lg">•</span> Total: <strong className="text-black text-lg">{group.totalPrice} TND</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase tracking-widest whitespace-nowrap ${statusClasses}`}>
                        {statusText}
                      </span>
                      <span className="text-black text-2xl font-black transition-transform">
                        {isExpanded ? "−" : "＋"}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 sm:p-8 bg-white">
                      {group.items.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b-2 border-gray-300 last:border-0 gap-4">
                          <div className="flex items-center gap-6">
                            {item.produitId?.image ? (
                              <img 
                                src={item.produitId.image} 
                                alt={item.produitId.titre || "Produit"} 
                                className="w-24 h-24 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black uppercase text-xs">N/A</div>
                            )}
                            
                            <div>
                              <p className="font-black text-xl uppercase tracking-wider mb-2 text-black">
                                {item.produitId?.titre || "Produit supprimé"}
                              </p>
                              <p className="font-serif italic text-gray-600 font-bold">
                                Taille : {item.tailleChoisie} <span className="mx-2 text-black not-italic font-black">|</span> Qté : {item.quantite || 1}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-center gap-4">
                            <div className="font-black text-2xl bg-[#e6ff00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {(item.produitId?.prix || 0) * (item.quantite || 1)} TND
                            </div>
                            {item.produitId && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  openViewModal(item); 
                                }}
                                className="px-4 py-2 bg-black text-white font-black uppercase text-xs border-2 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              >
                                Détails
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {group.statutGlobal && group.statutGlobal.toLowerCase().includes("attente") && (
                        <div className="flex justify-end mt-8 pt-8 border-t-4 border-black">
                          <button 
                            onClick={() => handleCancelOrder(group.items)}
                            className="px-8 py-4 bg-red-500 text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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

        {isModalOpen && selectedProduct && selectedProduct.produitId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 md:p-10 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-4 -right-4 bg-[#e6ff00] border-4 border-black text-black w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
              >
                ✕
              </button>
              
              {selectedProduct.produitId.image ? (
                <img 
                  src={selectedProduct.produitId.image} 
                  alt={selectedProduct.produitId.titre} 
                  className="w-full h-72 object-cover border-4 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                />
              ) : (
                <div className="w-full h-72 bg-gray-200 border-4 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black uppercase text-xl">Sans Image</div>
              )}
              
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{selectedProduct.produitId.titre}</h3>
              
              <div className="inline-block bg-[#e6ff00] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                <p className="text-2xl font-black m-0">{selectedProduct.produitId.prix} TND</p>
              </div>
              
              {selectedProduct.produitId.description && (
                <p className="font-serif text-lg leading-relaxed mb-8 border-l-4 border-black pl-4">
                  {selectedProduct.produitId.description}
                </p>
              )}
              
              <div className="bg-gray-100 p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-black uppercase tracking-widest text-lg mb-4 text-black border-b-4 border-black pb-2">Récapitulatif</h4>
                <div className="space-y-3 text-sm font-bold uppercase tracking-wider text-black">
                  <p className="flex justify-between border-b-2 border-gray-300 pb-2">
                    <span className="text-gray-600">Taille</span> 
                    <span className="font-black">{selectedProduct.tailleChoisie}</span>
                  </p>
                  <p className="flex justify-between border-b-2 border-gray-300 pb-2">
                    <span className="text-gray-600">Quantité</span> 
                    <span className="font-black">{selectedProduct.quantite || 1}</span>
                  </p>
                  <p className="flex justify-between pt-2 text-lg">
                    <span className="text-black">Sous-total</span> 
                    <span className="font-black bg-[#e6ff00] px-2 border-2 border-black">{(selectedProduct.produitId.prix || 0) * (selectedProduct.quantite || 1)} TND</span>
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