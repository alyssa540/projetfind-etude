import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { logout } from "../JS/userSlice/userSlice"; 

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
    } catch (error) {
      console.error("Erreur mise à jour statut", error);
      alert("Erreur lors de la mise à jour (Vérifiez la console)");
    }
  };

  const archiverCommande = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: token } };

      await axios.put(`http://localhost:5000/api/orders/${orderId}/archive`, {}, config);
      setCommandesRecues(commandesRecues.filter(cmd => cmd._id !== orderId));
    } catch (error) {
      console.error("Erreur lors de l'archivage", error);
      alert("Erreur lors de l'archivage.");
    }
  };

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login"); 
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfaf6] font-sans">
        <h2 className="text-[#3b332b] font-light text-2xl mb-5">Accès restreint</h2>
        <button 
          className="px-6 py-2.5 bg-[#cba88c] text-white rounded-md font-semibold hover:bg-[#b59276] transition"
          onClick={() => navigate("/login")}
        >
          SE CONNECTER
        </button>
      </div>
    );
  }

  // Helper pour les couleurs des badges de statut
  const getStatusClasses = (statut) => {
    switch(statut) {
      case 'en_attente': return 'bg-[#fff3cd] text-[#856404]';
      case 'confirmee': return 'bg-[#d4edda] text-[#155724]';
      case 'declinee': return 'bg-[#f8d7da] text-[#721c24]';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-sans text-[#3b332b] py-16 px-5">
      <div className="max-w-[900px] mx-auto">
        
        {/* --- CARTE PROFIL PRINCIPALE --- */}
        <div className="bg-white border border-[#ece5dd] rounded-xl p-8 flex flex-col gap-6 shadow-sm mb-8">
          
          <div className="flex items-center gap-5 border-b border-[#ece5dd] pb-6">
            {user.role === "styliste" && user.logo ? (
              <img src={user.logo} alt="Logo" className="w-[90px] h-[90px] rounded-full object-cover border-[3px] border-[#cba88c]" />
            ) : (
              <div className="w-[90px] h-[90px] rounded-full bg-[#f4ece2] border-[3px] border-[#cba88c] flex items-center justify-center text-2xl font-bold text-[#8c7e71] uppercase">
                {user.name.charAt(0)}{user.lastname.charAt(0)}
              </div>
            )}
            
            <div>
              <h2 className="text-[26px] font-semibold m-0 mb-1.5">{user.name} {user.lastname}</h2>
              <span className="inline-block bg-[#f4ece2] text-[#b59276] px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wide">
                {user.role === 'styliste' ? 'Styliste Créateur' : 'Membre Privilège'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd]">
              <label className="block text-xs text-[#8c7e71] uppercase mb-1">Email</label>
              <span className="text-[15px] font-medium">{user.email}</span>
            </div>
            <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd]">
              <label className="block text-xs text-[#8c7e71] uppercase mb-1">Téléphone</label>
              <span className="text-[15px] font-medium">{user.phone || "Non renseigné"}</span>
            </div>
            <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd]">
              <label className="block text-xs text-[#8c7e71] uppercase mb-1">
                {user.role === "styliste" ? "Adresse Atelier" : "Adresse de livraison"}
              </label>
              <span className="text-[15px] font-medium">{user.adress || "Non renseigné"}</span>
            </div>
            
            {user.role === "client" && (
              <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd]">
                <label className="block text-xs text-[#8c7e71] uppercase mb-1">Taille</label>
                <span className="text-[15px] font-medium">{user.taille || "Non renseigné"}</span>
              </div>
            )}
            
            {user.role === "styliste" && (
              <div className="bg-[#fdfaf6] p-4 rounded-lg border border-[#ece5dd]">
                <label className="block text-xs text-[#8c7e71] uppercase mb-1">Nom de la marque</label>
                <span className="text-[15px] font-medium">{user.nom_marque || "Non renseigné"}</span>
              </div>
            )}
          </div>

          {/* Boutons d'action du profil */}
          <div className="flex gap-3 mt-2 flex-wrap">
            
            {user.role === "styliste" && (
              <button 
                className="px-5 py-2.5 rounded-md text-sm font-semibold transition-colors bg-[#cba88c] text-white border border-[#cba88c] hover:bg-[#b59276]"
                onClick={() => navigate("/add-product")}
              >
                + Ajouter une création
              </button>
            )}
           
          </div>
        </div>

        {/* --- SECTION DES COMMANDES (Styliste) --- */}
        {user.role === "styliste" && (
          <div>
            <h3 className="text-[22px] font-semibold mb-5 border-l-4 border-[#cba88c] pl-3">Commandes reçues</h3>
            {commandesRecues.length === 0 ? (
              <p className="text-[#8c7e71]">Aucune commande à traiter pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {commandesRecues.map((cmd) => (
                  <div key={cmd._id} className="bg-white border border-[#ece5dd] rounded-lg p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-base m-0 text-[#3b332b]">{cmd.produitId?.titre || "Produit inconnu"}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClasses(cmd.statut)}`}>
                          {cmd.statut.replace("_", " ")}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[14px] text-[#8c7e71] m-0"><strong className="text-[#3b332b]">Client :</strong> {cmd.clientId?.name || ""} {cmd.clientId?.lastname || ""}</p>
                        <p className="text-[14px] text-[#8c7e71] m-0"><strong className="text-[#3b332b]">Email :</strong> {cmd.clientId?.email}</p>
                        <p className="text-[14px] text-[#8c7e71] m-0"><strong className="text-[#3b332b]">Taille choisie :</strong> {cmd.tailleChoisie}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5 flex-wrap">
                      {cmd.statut === "en_attente" && (
                        <>
                          <button 
                            className="px-3 py-1.5 text-xs font-semibold rounded bg-[#6b8e6b] text-white hover:bg-[#5a7a5a] transition"
                            onClick={() => changerStatut(cmd._id, "confirmee")}
                          >
                            Confirmer
                          </button>
                          <button 
                            className="px-3 py-1.5 text-xs font-semibold rounded bg-[#b86b6b] text-white hover:bg-[#a15d5d] transition"
                            onClick={() => changerStatut(cmd._id, "declinee")}
                          >
                            Refuser
                          </button>
                        </>
                      )}
                      <button 
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-[#9ba3af] text-white hover:bg-[#868d98] transition"
                        onClick={() => archiverCommande(cmd._id)}
                      >
                        Archiver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SECTION DES ACHATS (Client) --- */}
        {user.role === "client" && (
          <div>
            <h3 className="text-[22px] font-semibold mb-5 border-l-4 border-[#cba88c] pl-3">Mes Achats</h3>
            {mesAchats.length === 0 ? (
              <p className="text-[#8c7e71]">Vous n'avez pas encore passé de commande.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {mesAchats.map((cmd) => (
                  <div key={cmd._id} className="bg-white border border-[#ece5dd] rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-base m-0 text-[#3b332b]">{cmd.produitId?.titre || "Produit inconnu"}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClasses(cmd.statut)}`}>
                        {cmd.statut.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#8c7e71] m-0"><strong className="text-[#3b332b]">Taille commandée :</strong> {cmd.tailleChoisie}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BOUTON RECOMMANDATION IA */}
            <div className="mt-10 pt-6 border-t border-[#ece5dd] flex justify-center">
              <button 
                onClick={() => navigate("/Preference-form")} 
                className="w-full md:w-auto px-8 py-3.5 bg-[#3b332b] text-white text-[15px] rounded-lg font-bold hover:bg-[#2a241e] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                ✨ Trouver mon style avec l'IA
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}

export default Profil;