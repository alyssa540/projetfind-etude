import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

function Profil() {
  // ==========================================
  // 1️⃣ TOUS LES HOOKS EN HAUT (La règle d'or !)
  // ==========================================
  const user = useSelector((state) => state.user?.user); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tous nos states
  const [mesCreations, setMesCreations] = useState([]);
  const [commandesRecues, setCommandesRecues] = useState([]); 
  const [mesAchats, setMesAchats] = useState([]); 

  // Premier useEffect : Pour charger le portfolio du styliste
  useEffect(() => {
    if (user && user.role === 'styliste') {
      const fetchMesCreations = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/products/all");
          // On filtre pour ne garder que SES produits à lui
          const mesProduits = res.data.products.filter(
            (product) => product.stylisteId === user._id
          );
          setMesCreations(mesProduits);
        } catch (error) {
          console.error("Erreur lors de la récupération des créations :", error);
        }
      };
      fetchMesCreations();
    }
  }, [user]);

  // Deuxième useEffect : Pour charger les commandes (Styliste ou Client)
  useEffect(() => {
    if (!user) return; // Si pas connecté, on s'arrête là

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (user.role === "styliste") {
          const res = await axios.get("http://localhost:5000/api/orders/stylist", config);
          setCommandesRecues(res.data.orders);
        } else if (user.role === "client") {
          const res = await axios.get("http://localhost:5000/api/orders/my-orders", config);
          setMesAchats(res.data.orders);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      }
    };

    fetchOrders();
  }, [user]);

  // ==========================================
  // 2️⃣ LES FONCTIONS
  // ==========================================
  const changerStatut = async (orderId, nouveauStatut) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { statut: nouveauStatut }, config);
      
      setCommandesRecues(commandesRecues.map(cmd => 
        cmd._id === orderId ? { ...cmd, statut: nouveauStatut } : cmd
      ));

      alert(`Commande ${nouveauStatut === 'confirmee' ? 'acceptée ✅' : 'refusée ❌'}`);
    } catch (error) {
      console.error("Erreur mise à jour statut", error);
    }
  };

  // ==========================================
  // 3️⃣ LA SÉCURITÉ (Si l'utilisateur n'est pas connecté)
  // ==========================================
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2 style={{ color: "#3b332b", fontWeight: 300 }}>Accès restreint</h2>
        <button className="btn-custom btn-nude-dark" onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>
          SE CONNECTER
        </button>
      </div>
    );
  }

  // ==========================================
  // 4️⃣ LE DESIGN (HTML/CSS INTACT !)
  // ==========================================
  return (
    <div>
      {/* LE HAUT DE LA PAGE : LE PROFIL (Identique à avant) */}
      <div className="profil-container"  style={{ marginTop: "100px" }}>
        <img className="side-image" src="https://i.pinimg.com/1200x/91/de/f4/91def4dd6f6f380df45b188ebad78927.jpg" alt="Fashion Minimalist" />

        <div className="profile-card">
          
          <h2 className="profile-name">{user.name} {user.lastname}</h2>
          <p className="profile-role">
            {user.role === 'styliste' ? 'Styliste Créateur' : 'Membre Privilège'}
          </p>

          {user.role === "client" ? (
            <div className="profile-section">
              <h5>Mes Informations</h5>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Taille :</strong> {user.mensurations?.taille || "Non renseigné"}</p>
              <div className="btn-group">
                <button className="btn-custom btn-nude-dark"  onClick={() => navigate("/edit-profile")}>Mettre à jour</button>
              </div>
            </div>
          ) : (
            <div className="profile-section">
              <h5>Espace Créateur</h5>
              <p><strong>Contact :</strong> {user.email}</p>
              <div className="btn-group">
                <button className="btn-custom btn-nude-dark" onClick={() => navigate("/add-product")} >Ajouter une création</button>
              </div>
            </div>
          )}

          <button className="btn-custom btn-logout-elegant" onClick={() => navigate("/login")}>
            SE DÉCONNECTER
          </button>
        </div>

        <img className="side-image" src="https://i.pinimg.com/avif/1200x/ce/b5/18/ceb518c9371d3ee0cb1117f70afe3922.avf" alt="Nude Aesthetic Fabric" />
      </div>

      {/* LE BAS DE LA PAGE : LA GALERIE DU STYLISTE */}
      {user.role === "styliste" && (
        <div className="mes-creations-wrapper">
          <h3 className="mes-creations-title">Mon Portfolio</h3>
          
          {mesCreations.length === 0 ? (
            <p style={{ color: "#8c735f" }}>Vous n'avez pas encore ajouté de créations.</p>
          ) : (
            <div className="creations-grid">
              {mesCreations.map((creation) => (
                <div key={creation._id} className="creation-mini-card">
                  <img src={creation.image} alt={creation.titre} className="creation-img" />
                  <div className="creation-info">
                    <h4>{creation.titre}</h4>
                    <p>{creation.prix} TND</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SECTION STYLISTE : GESTION DES COMMANDES --- */}
      {user.role === "styliste" && (
        <div className="orders-section" style={{ marginTop: "40px", padding: "20px" }}>
          <h3>Commandes reçues</h3>
          {commandesRecues.length === 0 ? (
            <p>Aucune commande pour le moment.</p>
          ) : (
            <div className="orders-list">
              {commandesRecues.map((cmd) => (
                <div key={cmd._id} style={{ border: "1px solid #e6dace", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
                  <p><strong>Article :</strong> {cmd.produitId?.titre}</p>
                  <p><strong>Client :</strong> {cmd.clientId?.name} ({cmd.clientId?.email})</p>
                  <p><strong>Taille :</strong> {cmd.tailleChoisie}</p>
                  <p><strong>Statut actuel :</strong> {cmd.statut}</p>

                  {/* Boutons d'action : on les affiche seulement si la commande est en attente */}
                  {cmd.statut === "en_attente" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button 
                        onClick={() => changerStatut(cmd._id, "confirmee")}
                        style={{ backgroundColor: "#4CAF50", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Confirmer ✔️
                      </button>
                      <button 
                        onClick={() => changerStatut(cmd._id, "declinee")}
                        style={{ backgroundColor: "#f44336", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Refuser ❌
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SECTION CLIENT : SUIVI DES ACHATS --- */}
      {user.role === "client" && (
        <div className="orders-section" style={{ marginTop: "40px", padding: "20px" }}>
          <h3>Mes Achats</h3>
          {mesAchats.length === 0 ? (
            <p>Vous n'avez encore rien commandé.</p>
          ) : (
            <div className="orders-list">
              {mesAchats.map((achat) => (
                <div key={achat._id} style={{ border: "1px solid #e6dace", padding: "15px", marginBottom: "10px", borderRadius: "8px" }}>
                  <p><strong>Article :</strong> {achat.produitId?.titre}</p>
                  <p><strong>Taille :</strong> {achat.tailleChoisie}</p>
                  <p>
                    <strong>État de la commande : </strong> 
                    <span style={{ 
                      fontWeight: "bold",
                      color: achat.statut === "confirmee" ? "green" : achat.statut === "declinee" ? "red" : "orange" 
                    }}>
                      {achat.statut === "en_attente" ? "En attente de validation ⏳" : 
                       achat.statut === "confirmee" ? "Confirmée ! Préparation en cours ✅" : "Refusée ❌"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Profil;