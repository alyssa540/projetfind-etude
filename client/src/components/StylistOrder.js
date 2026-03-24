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

        // --- LOGIQUE DE REGROUPEMENT POUR LE STYLISTE ---
        // On groupe par Produit ID + Taille (ex: "id_du_produit-L")
        const groups = {};

        rawOrders.forEach(order => {
          // Si le produit a été supprimé de la base, on ignore ou on gère
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
              // On garde une trace de toutes les commandes individuelles pour pouvoir 
              // mettre à jour leur statut plus tard
              orderIds: [], 
              clients: [], // Liste des clients pour info
              // On prend le statut de la première commande comme référence pour le lot
              // (Dans un cas réel, il faudrait une logique plus complexe si les statuts diffèrent)
              statusGroup: order.statut || "en_attente" 
            };
          }

          // On additionne la quantité
          groups[groupKey].quantiteTotale += (order.quantite || 1);
          groups[groupKey].orderIds.push(order._id);
          
          // On ajoute le client s'il n'est pas déjà dans la liste
          const clientName = order.clientId ? `${order.clientId.name} ${order.clientId.lastname}` : "Client Inconnu";
          if (!groups[groupKey].clients.includes(clientName)) {
             groups[groupKey].clients.push(clientName);
          }
        });

        // Conversion de l'objet en tableau pour l'affichage
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

  // Fonction pour mettre à jour le statut d'un LOT complet
  const handleUpdateGroupStatus = async (group, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // On met à jour chaque commande individuelle contenue dans ce groupe
      // Note: Idéalement, il faudrait une route backend "update multiple orders" 
      // pour éviter de faire plusieurs appels réseau. Ici on fait une boucle par simplicité.
      const updatePromises = group.orderIds.map(orderId => 
        axios.put(
          `http://localhost:5000/api/orders/${orderId}`,
          // Assurez-vous que votre backend attend 'statut' et non 'status' comme défini dans votre Mongoose schema
          { statut: newStatus }, 
          { headers: { Authorization: token } }
        )
      );

      await Promise.all(updatePromises);

      // Mise à jour de l'état local
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

  const getStatusDisplay = (status) => {
    switch(status) {
      case "en_attente": return { text: "En attente", color: "#f39c12", bg: "#fdf2e9" };
      case "confirmee": return { text: "En préparation", color: "#3498db", bg: "#ebf5fb" }; // Le styliste a accepté, il prépare
      case "expediee": return { text: "Expédiée", color: "#2ecc71", bg: "#eafaf1" }; // Si vous ajoutez ce statut plus tard
      case "declinee": return { text: "Refusée/Annulée", color: "#e74c3c", bg: "#fdedec" };
      default: return { text: status, color: "#7f8c8d", bg: "#f2f3f4" };
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Accès refusé.</h2>
        <p>Espace réservé aux créateurs.</p>
      </div>
    );
  }

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Chargement de vos ventes...</h2>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Mes Ventes (Tableau de bord Styliste)</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Gérez vos productions par articles et par tailles.
      </p>

      {groupedOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h4 style={{ marginBottom: "20px" }}>Vous n'avez pas encore de commandes.</h4>
          <p>Continuez à ajouter des créations pour attirer des clients !</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4", borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "15px", fontWeight: "bold" }}>Création</th>
                <th style={{ padding: "15px", fontWeight: "bold" }}>Taille</th>
                <th style={{ padding: "15px", fontWeight: "bold" }}>Qté Totale</th>
                <th style={{ padding: "15px", fontWeight: "bold" }}>Clients</th>
                <th style={{ padding: "15px", fontWeight: "bold" }}>Statut du lot</th>
                <th style={{ padding: "15px", fontWeight: "bold", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedOrders.map((group) => {
                const statusStyle = getStatusDisplay(group.statusGroup);
                
                return (
                  <tr key={group.id} style={{ borderBottom: "1px solid #eee" }}>
                    
                    {/* --- PRODUIT (Image + Titre) --- */}
                    <td style={{ padding: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
                      <img 
                        src={group.produit.image || "https://via.placeholder.com/50"} 
                        alt={group.produit.titre} 
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <span style={{ fontWeight: "bold" }}>{group.produit.titre}</span>
                    </td>
                    
                    {/* --- TAILLE --- */}
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#555" }}>
                      {group.taille}
                    </td>
                    
                    {/* --- QUANTITÉ --- */}
                    <td style={{ padding: "15px" }}>
                      <span style={{ 
                        backgroundColor: "#333", 
                        color: "#fff", 
                        padding: "5px 10px", 
                        borderRadius: "20px",
                        fontWeight: "bold"
                      }}>
                        {group.quantiteTotale}
                      </span>
                    </td>
                    
                    {/* --- CLIENTS --- */}
                    <td style={{ padding: "15px", fontSize: "0.85em", color: "#666" }}>
                      {group.clients.map((c, i) => <div key={i}>{c}</div>)}
                    </td>
                    
                    {/* --- STATUT --- */}
                    <td style={{ padding: "15px" }}>
                      <span style={{ 
                        padding: "6px 12px", 
                        borderRadius: "20px", 
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: "bold",
                        fontSize: "0.85em"
                      }}>
                        {statusStyle.text}
                      </span>
                    </td>
                    
                    {/* --- ACTIONS --- */}
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      
                      {group.statusGroup === "en_attente" && (
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button 
                            style={{ padding: "6px 10px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85em" }}
                            onClick={() => handleUpdateGroupStatus(group, "confirmee")}
                          >
                            Accepter lot
                          </button>
                          <button 
                            style={{ padding: "6px 10px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85em" }}
                            onClick={() => handleUpdateGroupStatus(group, "declinee")}
                          >
                            Refuser lot
                          </button>
                        </div>
                      )}

                      {group.statusGroup === "confirmee" && (
                        <button 
                          style={{ padding: "6px 12px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9em", width: "100%" }}
                          onClick={() => handleUpdateGroupStatus(group, "expediee")} // Nécessite que 'expediee' soit ajouté à votre enum côté backend
                        >
                          Marquer lot Expédié
                        </button>
                      )}
                      
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StylistOrders;