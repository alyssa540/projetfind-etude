import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function StylistOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/stylist", {
          headers: { Authorization: token },
        });
        setOrders(res.data.orders || []);
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // Petite fonction pour donner une couleur au statut
  const getStatusClass = (status) => {
    if (!status || status === "En attente") return "status-attente";
    if (status === "En préparation") return "status-preparation";
    if (status === "Expédiée") return "status-expediee";
    if (status === "Annulée") return "status-annulee";
    return "";
  };

  if (user?.role !== "styliste") {
    return (
      <div className="access-denied">
        <h2>Accès refusé.</h2>
        <p>Espace réservé aux créateurs.</p>
      </div>
    );
  }

  if (loading) return <div className="loading-elegant">Chargement des commandes...</div>;

  return (
    <div className="orders-wrapper">
      <div className="orders-header">
        <h2 className="orders-title">Mes Ventes</h2>
        <p className="orders-subtitle">Gérez ici les commandes passées par vos clients.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h4>Vous n'avez pas encore de commandes.</h4>
          <p>Continuez à ajouter des créations pour attirer des clients !</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Création</th>
                <th>Taille</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div className="client-info">
                      <span className="client-name">{order.clientId?.name} {order.clientId?.lastname}</span>
                      <span className="client-email">{order.clientId?.email}</span>
                    </div>
                  </td>
                  <td className="product-cell">{order.produitId?.titre}</td>
                  <td><span className="size-indicator">{order.tailleChoisie}</span></td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status || "En attente"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {(!order.status || order.status === "En attente") && (
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-accept" 
                          onClick={() => handleUpdateStatus(order._id, "En préparation")}
                        >
                          Accepter
                        </button>
                        <button 
                          className="btn-action btn-reject"
                          onClick={() => handleUpdateStatus(order._id, "Annulée")}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                    {order.status === "En préparation" && (
                      <button 
                        className="btn-action btn-ship"
                        onClick={() => handleUpdateStatus(order._id, "Expédiée")}
                      >
                        Marquer Expédiée
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StylistOrders;