import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function MesCommandes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // On récupère le client connecté
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // On appelle TA route backend pour récupérer l'historique du client
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: token },
        });
        
        setOrders(res.data.orders || []);
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

  // Sécurité : uniquement pour les clients
  if (user?.role !== "client") {
    return <h2>Accès réservé aux clients.</h2>;
  }

  if (loading) return <h2 >Chargement de votre historique... </h2>;

  return (
    <div >
      <h2>Mes Commandes </h2>
      <p >
        Suivez ici l'état des achats que vous avez effectués auprès de nos stylistes.
      </p>

      {orders.length === 0 ? (
        <div >
          <h4>Vous n'avez pas encore passé de commande.</h4>
          <Link to="/catalogue" className="btn btn-primary">
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div >
          {orders.map((order) => (
            <div key={order._id} >
              <div >
                {/* On affiche l'image si le backend la renvoie via le populate */}
                <img 
                  src={order.produitId?.image || "https://via.placeholder.com/80"} 
                  alt="Produit" 
                  
                />
                <div>
                  <h4>{order.produitId?.titre || "Produit supprimé"}</h4>
                  <p>
                    Taille choisie : <strong>{order.tailleChoisie}</strong>
                  </p>
                </div>
              </div>

              <div >
                {/* Affichage du statut avec une couleur différente selon l'état */}
                <span >
                  {order.statut === "confirmee" ? "Confirmée " : 
                   order.statut === "declinee" ? "Refusée " : 
                   "En attente ⏳"}
                </span>
                <p >
                  {order.produitId?.prix ? `${order.produitId.prix} €` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




export default MesCommandes;