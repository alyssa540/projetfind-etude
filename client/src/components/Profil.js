import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { logout } from "../JS/userSlice/userSlice"; // 2. Import your logout action (adjust the path if necessary!)


function Profil() {

  const user = useSelector((state) => state.user?.user); 
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [commandesRecues, setCommandesRecues] = useState([]); 
  const [mesAchats, setMesAchats] = useState([]); 

 
  

  
  useEffect(() => {
    if (!user) return; 

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); 
       
        const config = { headers: { Authorization: token } };

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

  const changerStatut = async (orderId, nouveauStatut) => {
    try {
      const token = localStorage.getItem("token");
    
      const config = { headers: { Authorization: token } };

      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { statut: nouveauStatut }, config);
      
      setCommandesRecues(commandesRecues.map(cmd => 
        cmd._id === orderId ? { ...cmd, statut: nouveauStatut } : cmd
      ));

      alert(`Commande ${nouveauStatut === 'confirmee' ? 'acceptée ' : 'refusée '}`);
    } catch (error) {
      console.error("Erreur mise à jour statut", error);
      alert("Erreur lors de la mise à jour (Vérifiez la console)");
    }
  };

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
  
  const handleLogout = () => {
    // 4. Dispatch the logout action! This clears Redux AND localStorage
    dispatch(logout()); 
    navigate("/login"); 
  };
  return (
    <div>
    
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

          <button className="btn-custom btn-logout-elegant" onClick={() => handleLogout()}>
            SE DÉCONNECTER
          </button>
        </div>

        <img className="side-image" src="https://i.pinimg.com/avif/1200x/ce/b5/18/ceb518c9371d3ee0cb1117f70afe3922.avf" alt="Nude Aesthetic Fabric" />
      </div>

      
     

     
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

                
                  {cmd.statut === "en_attente" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button 
                        onClick={() => changerStatut(cmd._id, "confirmee")}
                        style={{ backgroundColor: "#4CAF50", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Confirmer 
                      </button>
                      <button 
                        onClick={() => changerStatut(cmd._id, "declinee")}
                        style={{ backgroundColor: "#f44336", color: "white", padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Refuser 
                      </button>
                    </div>
                  )}
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