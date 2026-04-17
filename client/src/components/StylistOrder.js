import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function StylistOrders() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/stylist", {
          headers: { Authorization: token },
        });
        
        const rawOrders = res.data.orders || [];

        const groups = {};

        rawOrders.forEach(order => {
          if (!order.produitId) return; 

          const produit = order.produitId;
          const taille = order.tailleChoisie;
          const groupKey = `${produit._id}-${taille}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              id: groupKey,
              produit: produit,
              taille: taille,
              quantiteTotale: 0,
              orderIds: [], 
              clients: [], 
              statusGroup: order.statut || "en_attente" 
            };
          }

          groups[groupKey].quantiteTotale += (order.quantite || 1);
          groups[groupKey].orderIds.push(order._id);
          
          // 👇 HNA BADDELNA BECH NFIQOU BEL MOCHKEL (DEBUG)
          let clientName = "Client Inconnu";
          if (order.clientId) {
            console.log("Client récupéré depuis la base :", order.clientId);
            
            const nom = order.clientId.name || "";
            // N7OTTOU EZZOUZ: lastName wala lastname bech nethanew!
            const prenom = order.clientId.lastName || order.clientId.lastname || ""; 
            
            clientName = `${nom} ${prenom}`.trim(); 
          }
          
          if (!groups[groupKey].clients.includes(clientName)) {
             groups[groupKey].clients.push(clientName);
          }
        });

        setGroupedOrders(Object.values(groups));
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        setLoading(false);
      }
    };

    if (user?.role === "styliste") {
      fetchOrders();
    }
  }, [user]);

  const handleUpdateGroupStatus = async (group, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      const updatePromises = group.orderIds.map(orderId => 
        axios.put(
          `http://localhost:5000/api/orders/${orderId}/status`,
          { statut: newStatus }, 
          { headers: { Authorization: token } }
        )
      );

      await Promise.all(updatePromises);

      setGroupedOrders(prevGroups => 
        prevGroups.map(g => 
          g.id === group.id ? { ...g, statusGroup: newStatus } : g
        )
      );
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleArchiveGroup = async (group) => {
    try {
      const token = localStorage.getItem("token");
      
      const archivePromises = group.orderIds.map(orderId => 
        axios.put(
          `http://localhost:5000/api/orders/${orderId}/archive`,
          {}, 
          { headers: { Authorization: token } }
        )
      );

      await Promise.all(archivePromises);

      setGroupedOrders(prevGroups => prevGroups.filter(g => g.id !== group.id));
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'archivage.");
    }
  };

  // Passage des couleurs inline aux classes Tailwind
  const getStatusDisplay = (status) => {
    switch(status) {
      case "en_attente": return { text: "En attente", classes: "text-amber-700 bg-amber-100" };
      case "confirmee": return { text: "En préparation", classes: "text-blue-700 bg-blue-100" }; 
      case "expediee": return { text: "Expédiée", classes: "text-emerald-700 bg-emerald-100" }; 
      case "declinee": return { text: "Refusée", classes: "text-red-700 bg-red-100" };
      default: return { text: status.replace("_", " "), classes: "text-gray-700 bg-gray-100" };
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-2xl font-bold mb-2">Accès refusé.</h2>
        <p className="text-[#8c7e71]">Espace réservé aux créateurs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-xl font-semibold animate-pulse">Chargement de vos ventes...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-28 pb-12 px-5 font-sans text-[#3b332b]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-semibold mb-2 text-[#3b332b]">Mes Ventes</h2>
        <p className="text-center text-[#8c7e71] mb-10">
          Gérez vos productions par articles et par tailles.
        </p>

        {groupedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#ece5dd] border-dashed rounded-xl shadow-sm">
            <h4 className="text-lg font-semibold mb-2 text-[#4a4036]">Vous n'avez pas encore de commandes.</h4>
            <p className="text-[#8c7e71]">Continuez à ajouter des créations pour attirer des clients !</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#ece5dd] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4ece2] text-[#4a4036] border-b-2 border-[#ece5dd]">
                    <th className="p-4 font-semibold whitespace-nowrap">Création</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Taille</th>
                    <th className="p-4 font-semibold whitespace-nowrap text-center">Qté Totale</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Clients</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Statut du lot</th>
                    <th className="p-4 font-semibold whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece5dd]">
                  {groupedOrders.map((group) => {
                    const statusStyle = getStatusDisplay(group.statusGroup);
                    
                    return (
                      <tr key={group.id} className="hover:bg-[#fdfaf6] transition-colors">
                        <td className="p-4 flex items-center gap-4 min-w-[200px]">
                          {group.produit.image ? (
                            <img 
                              src={group.produit.image} 
                              alt={group.produit.titre} 
                              className="w-12 h-12 object-cover rounded-md border border-[#ece5dd]"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#f4ece2] rounded-md border border-[#ece5dd] flex items-center justify-center text-xs text-[#8c7e71]">Img</div>
                          )}
                          <span className="font-semibold text-[#3b332b]">{group.produit.titre}</span>
                        </td>
                        
                        <td className="p-4 font-bold text-[#8c7e71]">
                          {group.taille}
                        </td>
                        
                        <td className="p-4 text-center">
                          <span className="inline-block bg-[#3b332b] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {group.quantiteTotale}
                          </span>
                        </td>
                        
                        <td className="p-4 text-sm text-[#8c7e71]">
                          <div className="flex flex-col gap-1">
                            {group.clients.map((c, i) => <span key={i} className="whitespace-nowrap">{c}</span>)}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusStyle.classes}`}>
                            {statusStyle.text}
                          </span>
                        </td>
                        
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-2 w-full min-w-[140px]">
                            {group.statusGroup === "en_attente" && (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button 
                                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                                  onClick={() => handleUpdateGroupStatus(group, "confirmee")}
                                >
                                  Accepter lot
                                </button>
                                <button 
                                  className="flex-1 px-3 py-2 bg-red-400 hover:bg-red-500 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                                  onClick={() => handleUpdateGroupStatus(group, "declinee")}
                                >
                                  Refuser
                                </button>
                              </div>
                            )}

                            {group.statusGroup === "confirmee" && (
                              <button 
                                className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                                onClick={() => handleUpdateGroupStatus(group, "expediee")}
                              >
                                Marquer lot Expédié
                              </button>
                            )}

                            {(group.statusGroup === "expediee" || group.statusGroup === "declinee" || group.statusGroup === "annulee") && (
                              <button 
                                className="w-full px-3 py-2 bg-[#8c7e71] hover:bg-[#7a6c60] text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
                                onClick={() => handleArchiveGroup(group)}
                              >
                                Archiver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StylistOrders;