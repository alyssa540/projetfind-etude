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
          headers: { Authorization: `Bearer ${token}` },
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
          
          let clientName = "Client Inconnu";
          if (order.clientId) {
            const nom = order.clientId.name || "";
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
          { headers: { Authorization: `Bearer ${token}` } }
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
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(archivePromises);

      setGroupedOrders(prevGroups => prevGroups.filter(g => g.id !== group.id));
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'archivage.");
    }
  };

  const getStatusDisplay = (status) => {
    switch(status) {
      case "en_attente": return { text: "En attente", classes: "bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" };
      case "confirmee": return { text: "En préparation", classes: "bg-[#e6ff00] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" }; 
      case "expediee": return { text: "Expédiée", classes: "bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" }; 
      case "declinee": return { text: "Refusée", classes: "bg-red-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" };
      default: return { text: status.replace("_", " "), classes: "bg-gray-200 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" };
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-black px-6">
        <div className="bg-[#e6ff00] border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Accès refusé</h2>
          <p className="font-bold text-lg uppercase tracking-widest">Espace réservé aux créateurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-black">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
          <h2 className="text-2xl font-black uppercase tracking-widest">Chargement de vos ventes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-4 sm:px-8 lg:px-16 font-sans text-black relative">
      <div className="w-full max-w-[98vw] mx-auto">
        <h2 className="text-center text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-black">Mes Ventes</h2>
        <p className="text-center font-bold text-gray-600 mb-16 uppercase tracking-widest text-sm md:text-base">
          Gérez vos productions par articles et par tailles.
        </p>

        {groupedOrders.length === 0 ? (
          <div className="text-center p-16 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full mx-auto">
            <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-black">Vous n'avez pas encore de commandes.</h4>
            <p className="font-serif italic text-gray-600 font-bold text-xl md:text-2xl">Continuez à ajouter des créations pour attirer des clients !</p>
          </div>
        ) : (
          <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-none w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-[#e6ff00] border-b-4 border-black">
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black w-1/4">Création</th>
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black text-center">Taille</th>
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black text-center">Qté Totale</th>
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black w-1/4">Clients</th>
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black">Statut du lot</th>
                  <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base text-center w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                {groupedOrders.map((group) => {
                  const statusStyle = getStatusDisplay(group.statusGroup);
                  
                  return (
                    <tr key={group.id} className=" transition-colors">
                      <td className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border-r-4 border-black h-full min-w-0">
                        {group.produit.image ? (
                          <img 
                            src={group.produit.image} 
                            alt={group.produit.titre} 
                            className="w-24 h-24 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grayscale hover:grayscale-0 transition-all rounded-none flex-shrink-0"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-[#e6ff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-sm font-black uppercase rounded-none flex-shrink-0">Img</div>
                        )}
                        <span className="font-black text-xl md:text-2xl uppercase tracking-wider break-words">{group.produit.titre}</span>
                      </td>
                      
                      <td className="p-6 text-center font-black text-3xl border-r-4 border-black">
                        {group.taille}
                      </td>
                      
                      <td className="p-6 text-center border-r-4 border-black">
                        <span className="inline-block bg-black text-white px-5 py-3 text-2xl font-black shadow-[6px_6px_0px_0px_rgba(230,255,0,1)]">
                          {group.quantiteTotale}
                        </span>
                      </td>
                      
                      <td className="p-6 text-base border-r-4 border-black font-bold uppercase tracking-wide">
                        <div className="flex flex-wrap gap-3">
                          {group.clients.map((c, i) => (
                            <span key={i} className="bg-gray-100 px-3 py-2 border-2 border-black inline-block w-fit">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      
                      <td className="p-6 border-r-4 border-black text-center md:text-left">
                        <span className={`px-5 py-3 text-sm font-black uppercase tracking-widest inline-block ${statusStyle.classes}`}>
                          {statusStyle.text}
                        </span>
                      </td>
                      
                      <td className="p-6 align-middle">
                        <div className="flex flex-col gap-4 w-full">
                          {group.statusGroup === "en_attente" && (
                            <div className="flex flex-col gap-3">
                              <button 
                                className="w-full px-5 py-4 bg-[#e6ff00] text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none"
                                onClick={() => handleUpdateGroupStatus(group, "confirmee")}
                              >
                                Accepter
                              </button>
                              <button 
                                className="w-full px-5 py-4 bg-red-500 text-white border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none"
                                onClick={() => handleUpdateGroupStatus(group, "declinee")}
                              >
                                Refuser
                              </button>
                            </div>
                          )}

                          {group.statusGroup === "confirmee" && (
                            <button 
                              className="w-full px-5 py-4 bg-black text-white border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:text-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none"
                              onClick={() => handleUpdateGroupStatus(group, "expediee")}
                            >
                              Marquer Expédié
                            </button>
                          )}

                          {(group.statusGroup === "expediee" || group.statusGroup === "declinee" || group.statusGroup === "annulee") && (
                            <button 
                              className="w-full px-5 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none"
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
        )}
      </div>
    </div>
  );
}

export default StylistOrders;