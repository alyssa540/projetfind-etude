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

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Liste des tailles standards gérées
  const listeTailles = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  useEffect(() => {
    if (!user) return; 

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (user.role === "styliste") {
          const res = await axios.get("http://localhost:5000/api/orders/stylist", config);
          setCommandesRecues(res.data.orders);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      }
    };

    fetchOrders();
  }, [user]);

  const handleAIRequest = async () => {
    setLoadingAI(true);
    setAiError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/preference", { state: { aiProducts: res.data.products } });
    } catch {
      setAiError("Une erreur s'est produite avec l'IA. Vérifiez votre serveur.");
    } finally {
      setLoadingAI(false);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F7] font-sans p-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-black">Accès restreint</h2>
        <button 
          className="px-8 py-4 bg-black text-white border-2 border-black font-black uppercase tracking-widest hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          onClick={() => navigate("/login")}
        >
          Se connecter
        </button>
      </div>
    );
  }

  const getStatusClasses = (statut) => {
    switch(statut) {
      case 'en_attente': return 'bg-[#e6ff00] text-black border-2 border-black';
      case 'confirmee': return 'bg-green-400 text-black border-2 border-black';
      case 'declinee': return 'bg-red-400 text-black border-2 border-black';
      default: return 'bg-white text-black border-2 border-black';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-black pt-32 pb-24 px-6 relative">
      <div className="max-w-[1000px] mx-auto">
        
        {/* --- CARTE PROFIL PRINCIPALE --- */}
        <div className="bg-white border-4 border-black p-8 md:p-10 flex flex-col gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-black w-full pb-8">
            <div className="flex items-center gap-6 w-full">
              {user.role === "styliste" && user.logo ? (
                <img src={user.logo} alt="Logo" className="w-[100px] h-[100px] object-cover border-4 border-black grayscale-[20%]" />
              ) : (
                <div className="w-[100px] h-[100px] bg-[#e6ff00] border-4 border-black flex items-center justify-center text-4xl font-black text-black uppercase">
                  {user.name.charAt(0)}{user.lastname.charAt(0)}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0 mb-2">{user.name} {user.lastname}</h2>
                    <span className="inline-block bg-black text-[#e6ff00] border-2 border-black px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                      {user.role === 'styliste' ? 'Créateur' : 'Client'}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="px-5 py-3 bg-white text-black border-2 border-black font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF9F7] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Email</label>
              <span className="text-lg font-serif italic text-gray-600 truncate block" title={user.email}>{user.email}</span>
            </div>
            <div className="bg-[#FAF9F7] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Téléphone</label>
              <span className="text-lg font-serif italic text-gray-600">{user.phone || "Non renseigné"}</span>
            </div>
            <div className="bg-[#FAF9F7] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">
                {user.role === "styliste" ? "Adresse Atelier" : "Adresse de livraison"}
              </label>
              <span className="text-lg font-serif italic text-gray-600">{user.adress || "Non renseigné"}</span>
            </div>
            
            {/* Section Taille améliorée sous forme de sélecteur visuel brutaliste */}
            {user.role === "client" && (
              <div className="bg-[#FAF9F7] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-black text-black uppercase tracking-widest mb-3">Taille Profil</label>
                <div className="flex flex-wrap gap-2">
                  {listeTailles.map((taille) => {
                    const active = user.taille?.toUpperCase() === taille;
                    return (
                      <span 
                        key={taille} 
                        className={`px-4 py-2 text-sm font-black border-2 border-black transition-all ${
                          active 
                            ? "bg-black text-[#e6ff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5" 
                            : "bg-white text-gray-400 border-gray-300 opacity-60"
                        }`}
                      >
                        {taille}
                      </span>
                    );
                  })}
                </div>
                {!user.taille && (
                  <span className="text-xs font-serif italic text-gray-400 mt-2 block">Aucune taille sélectionnée</span>
                )}
              </div>
            )}
            
            {user.role === "styliste" && (
              <div className="bg-[#FAF9F7] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-xs font-black text-black uppercase tracking-widest mb-2">Marque</label>
                <span className="text-lg font-serif italic text-gray-600">{user.nom_marque || "Non renseigné"}</span>
              </div>
            )}
          </div>

          {user.role === "styliste" && (
            <div className="flex mt-4">
              <button 
                className="px-8 py-4 bg-black text-white border-2 border-black font-black uppercase text-sm tracking-widest hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                onClick={() => navigate("/add-product")}
              >
                + Ajouter une création
              </button>
            </div>
          )}
        </div>

       
                    
            
         

        {/* --- SECTION DES PRÉFÉRENCES (Client) --- */}
        {user.role === "client" && (
          <div>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-8 border-b-4 border-black pb-2 text-black">Mes Préférences</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-[#e6ff00] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Style</label>
                <span className="text-xl font-serif italic text-black capitalize">{user.preferences?.style || "Non renseigné"}</span>
              </div>
              <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Couleurs</label>
                <span className="text-xl font-serif italic text-gray-600">{user.preferences?.couleurs || "Non renseigné"}</span>
              </div>
              <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform duration-200">
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Occasion</label>
                <span className="text-xl font-serif italic text-gray-600 capitalize">{user.preferences?.occasion || "Non renseigné"}</span>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t-4 border-black">
              {aiError && (
                <div className="mb-4 p-4 bg-red-400 text-black font-black uppercase tracking-widest border-4 border-black text-sm text-center">
                  {aiError}
                </div>
              )}
              <button
                onClick={handleAIRequest}
                disabled={loadingAI}
                className="w-full py-6 bg-[#e6ff00] text-black text-xl md:text-2xl font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:bg-black hover:text-[#e6ff00] transition-all flex justify-center items-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingAI ? "Analyse en cours..." : "Analyser avec l'IA"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profil;