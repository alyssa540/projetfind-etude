import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function MesCommandes() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État pour gérer quels groupes (commandes) sont ouverts
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // --- NOUVEAU : ÉTAT DU MODAL DE DÉTAILS ---
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

        // --- LOGIQUE DE REGROUPEMENT ---
        // On regroupe les articles achetés en même temps (à la minute près)
        const groups = {};
        
        rawOrders.forEach(order => {
          // On crée une clé unique basée sur la date et l'heure (sans les secondes)
          const dateObj = new Date(order.createdAt);
          const dateStr = dateObj.toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' });
          const timeStr = `${dateObj.getHours()}h${String(dateObj.getMinutes()).padStart(2, '0')}`;
          const groupKey = `${dateStr} à ${timeStr}`;

          if (!groups[groupKey]) {
            groups[groupKey] = {
              id: groupKey,
              dateObj: dateObj, // Pour le tri
              displayDate: groupKey,
              items: [],
              totalPrice: 0,
              // On suppose que les articles achetés ensemble ont le même statut initial
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
      [groupId]: !prev[groupId] // Inverse l'état actuel (ouvert/fermé)
    }));
  };

  if (user?.role !== "client") {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Accès réservé aux clients.</h2>;
  }

  if (loading) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Chargement de votre historique...</h2>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Mes Commandes</h2>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        Retrouvez ici l'historique de vos achats. Cliquez sur une commande pour en voir les détails.
      </p>

      {groupedOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          <h4 style={{ marginBottom: "20px" }}>Vous n'avez pas encore passé de commande.</h4>
          <Link to="/catalogue" className="btn-premium" style={{ textDecoration: "none" }}>
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="orders-list" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {groupedOrders.map((group) => {
            const isExpanded = expandedGroups[group.id];
            
            // Couleur du statut global
            let statusColor = "#f39c12"; // En attente
            if (group.statutGlobal === "confirmee") statusColor = "#2ecc71";
            if (group.statutGlobal === "declinee") statusColor = "#e74c3c";

            return (
              <div key={group.id} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px",
                backgroundColor: "#fff",
                overflow: "hidden" // Empêche le contenu de déborder des coins arrondis
              }}>
                
                {/* --- EN-TÊTE DE LA COMMANDE (Cliquable) --- */}
                <div 
                  onClick={() => toggleGroup(group.id)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "15px 20px", 
                    backgroundColor: "#fcfcfc",
                    cursor: "pointer",
                    borderBottom: isExpanded ? "1px solid #ddd" : "none"
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1em" }}>Commande du {group.displayDate}</h4>
                    <span style={{ fontSize: "0.9em", color: "#666" }}>
                      {group.items.length} article(s) • Total : <strong>{group.totalPrice} TND</strong>
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ 
                      padding: "5px 12px", 
                      borderRadius: "20px", 
                      backgroundColor: `${statusColor}20`, 
                      color: statusColor,
                      fontWeight: "bold",
                      fontSize: "0.85em"
                    }}>
                      {group.statutGlobal === "confirmee" ? "Confirmée ✓" : 
                       group.statutGlobal === "declinee" ? "Refusée ✗" : "En attente ⏳"}
                    </span>
                    <span style={{ fontSize: "1.2em", color: "#999", width: "20px", textAlign: "center" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* --- DÉTAIL DES ARTICLES (Visible uniquement si isExpanded est true) --- */}
                {isExpanded && (
                  <div style={{ padding: "15px 20px", backgroundColor: "#fff" }}>
                    {group.items.map((item) => (
                      <div key={item._id} style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #eee"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <img 
                            src={item.produitId?.image || "https://via.placeholder.com/60"} 
                            alt={item.produitId?.titre || "Produit"} 
                            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                          />
                          <div>
                            <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
                              {item.produitId?.titre || "Produit supprimé"}
                            </p>
                            <p style={{ margin: "0", fontSize: "0.9em", color: "#777" }}>
                              Taille : {item.tailleChoisie} | Qté : {item.quantite || 1}
                            </p>
                          </div>
                        </div>
                        
                        {/* --- PRIX ET BOUTON VOIR (Modifié ici) --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                          <div style={{ fontWeight: "bold" }}>
                            {(item.produitId?.prix || 0) * (item.quantite || 1)} TND
                          </div>
                          {/* On n'affiche le bouton que si le produit existe encore dans la base */}
                          {item.produitId && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); // Évite de fermer/ouvrir l'accordéon si on clique à côté
                                openViewModal(item); 
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                              title="Voir les détails du produit"
                            >
                              👁️
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}

      {/* --- NOUVEAU : MODAL DE DÉTAILS DU PRODUIT (Adapté pour les commandes) --- */}
      {isModalOpen && selectedProduct && selectedProduct.produitId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '90%', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#333' }}
            >
              ✕
            </button>
            
            <img 
              src={selectedProduct.produitId.image || "https://via.placeholder.com/300"} 
              alt={selectedProduct.produitId.titre} 
              style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
            />
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>{selectedProduct.produitId.titre}</h3>
            <p style={{ fontWeight: 'bold', color: '#8c735f', fontSize: '1.2em' }}>{selectedProduct.produitId.prix} TND</p>
            
            {/* Description du produit (si elle existe via la jointure populate dans le backend) */}
            {selectedProduct.produitId.description && (
              <p style={{ marginTop: '15px', color: '#555', lineHeight: '1.5' }}>{selectedProduct.produitId.description}</p>
            )}
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Détails de l'achat</h4>
              <p style={{ margin: '0 0 5px 0' }}><strong>Taille commandée:</strong> {selectedProduct.tailleChoisie}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Quantité:</strong> {selectedProduct.quantite || 1}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Sous-total de l'article:</strong> {(selectedProduct.produitId.prix || 0) * (selectedProduct.quantite || 1)} TND</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MesCommandes;