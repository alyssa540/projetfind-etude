import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Archives() {
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();
  
  const [mesCommandes, setMesCommandes] = useState([]);
  const [mesCreations, setMesCreations] = useState([]);
  const [activeTab, setActiveTab] = useState("commandes"); 
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "styliste") {
      navigate("/login");
      return;
    }

    const fetchArchives = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: token } };
        
        // 1. Njibou les Commandes Archivées
        const resOrders = await axios.get("http://localhost:5000/api/orders/stylist/archives", config);
        setMesCommandes(resOrders.data.archives || []);

        // 2. Njibou les Créations Archivées
        const resCreations = await axios.get("http://localhost:5000/api/products/stylist/archives", config);
        setMesCreations(resCreations.data.creations || resCreations.data || []);

      } catch (error) {
        console.error("Erreur lors de la récupération des archives :", error);
      }
    };

    fetchArchives();
  }, [user, navigate]);

  // ==========================================
  // FONCTION : DÉSARCHIVER UNE CRÉATION
  // ==========================================
  const handleUnarchive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/products/${id}/unarchive`, {}, {
        headers: { Authorization: token }
      });
      
      // Mettre à jour l'affichage : nna7iw l'produit m'l'archive f'wa9tha
      setMesCreations(mesCreations.filter((creation) => creation._id !== id));
      alert("Création restaurée avec succès dans votre catalogue !");
      
    } catch (error) {
      console.error("Erreur lors du désarchivage :", error);
      alert("Erreur lors du désarchivage.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-28 pb-12 px-5 font-sans text-[#3b332b]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-3xl font-semibold mb-10 text-[#3b332b]">Mes Archives</h2>

        {/* --- ONGLETS (TABS) --- */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab("commandes")}
            className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-300 ${
              activeTab === "commandes" 
                ? "bg-[#3b332b] text-white shadow-md" 
                : "bg-[#f4ece2] text-[#8c7e71] hover:bg-[#ece5dd]"
            }`}
          >
            Commandes Archivées
          </button>
          <button
            onClick={() => setActiveTab("creations")}
            className={`px-6 py-2.5 rounded-md font-semibold transition-all duration-300 ${
              activeTab === "creations" 
                ? "bg-[#3b332b] text-white shadow-md" 
                : "bg-[#f4ece2] text-[#8c7e71] hover:bg-[#ece5dd]"
            }`}
          >
            Créations Archivées
          </button>
        </div>

        {/* --- AFFICHAGE DES COMMANDES ARCHIVÉES --- */}
        {activeTab === "commandes" && (
          <div className="space-y-4">
            {mesCommandes.length === 0 ? (
              <p className="text-center text-[#8c7e71] py-10 bg-white border border-[#ece5dd] rounded-xl border-dashed">
                Aucune commande archivée pour le moment.
              </p>
            ) : (
              mesCommandes.map((cmd) => (
                <div key={cmd._id} className="bg-white border border-[#ece5dd] p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-md transition-shadow">
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-3">
                      {cmd.produitId?.image ? (
                        <img 
                          src={cmd.produitId.image} 
                          alt={cmd.produitId.titre} 
                          className="w-14 h-14 object-cover rounded-lg border border-[#ece5dd]"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#f4ece2] rounded-lg border border-[#ece5dd] flex items-center justify-center text-[#8c7e71] text-xs">Image</div>
                      )}
                      <h4 className="font-semibold text-lg text-[#3b332b] m-0">{cmd.produitId?.titre || "Produit inconnu"}</h4>
                    </div>
                    
                    <div className="text-sm text-[#8c7e71] space-y-1">
                      <p><strong className="text-[#4a4036] font-medium">Client :</strong> {cmd.clientId?.name || ""} {cmd.clientId?.lastname || ""} <span className="text-xs">({cmd.clientId?.email})</span></p>
                      <p><strong className="text-[#4a4036] font-medium">Taille :</strong> {cmd.tailleChoisie}</p>
                      <p><strong className="text-[#4a4036] font-medium">Statut final :</strong> <span className="capitalize">{cmd.statut.replace("_", " ")}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <span className="px-3 py-1.5 bg-[#f4ece2] text-[#8c7e71] rounded-md text-xs font-semibold whitespace-nowrap">
                      Commande Archivée
                    </span>
                    <button 
                      onClick={() => setSelectedProduct(cmd.produitId)} 
                      className="w-full sm:w-auto px-4 py-2 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors whitespace-nowrap"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- AFFICHAGE DES CRÉATIONS ARCHIVÉES --- */}
        {activeTab === "creations" && (
          <div className="space-y-4">
            {mesCreations.length === 0 ? (
              <p className="text-center text-[#8c7e71] py-10 bg-white border border-[#ece5dd] rounded-xl border-dashed">
                Aucune création archivée pour le moment.
              </p>
            ) : (
              mesCreations.map((creation) => (
                <div key={creation._id} className="bg-white border border-[#ece5dd] p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-md transition-shadow">
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-3">
                      {creation.image ? (
                        <img 
                          src={creation.image} 
                          alt={creation.titre} 
                          className="w-14 h-14 object-cover rounded-lg border border-[#ece5dd]"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[#f4ece2] rounded-lg border border-[#ece5dd] flex items-center justify-center text-[#8c7e71] text-xs">Image</div>
                      )}
                      <h4 className="font-semibold text-lg text-[#3b332b] m-0">{creation.titre}</h4>
                    </div>
                    
                    <div className="text-sm text-[#8c7e71] space-y-1">
                      <p><strong className="text-[#4a4036] font-medium">Catégorie :</strong> {creation.categorie || "Non spécifiée"}</p>
                      <p><strong className="text-[#4a4036] font-medium">Prix :</strong> <span className="text-[#cba88c] font-bold">{creation.prix} TND</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <span className="hidden lg:block px-3 py-1.5 bg-[#f4ece2] text-[#8c7e71] rounded-md text-xs font-semibold whitespace-nowrap">
                      Création Archivée
                    </span>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleUnarchive(creation._id)} 
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#6b8e6b] text-white text-sm font-semibold rounded-md hover:bg-[#5a7a5a] transition-colors whitespace-nowrap"
                      >
                        Désarchiver 
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(creation)} 
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors whitespace-nowrap"
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- LE MODAL DE DÉTAILS --- */}
        {selectedProduct && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div 
              className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 text-3xl text-[#8c7e71] hover:text-[#b86b6b] leading-none transition-colors"
              >
                &times;
              </button>

              <h3 className="text-xl font-semibold text-[#3b332b] mb-4 pr-6 truncate">
                {selectedProduct.titre}
              </h3>
              
              <div className="overflow-y-auto pr-2 custom-scrollbar">
                {selectedProduct.image && (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.titre} 
                    className="w-full h-56 object-contain rounded-lg bg-[#fdfaf6] border border-[#ece5dd] mb-5"
                  />
                )}

                <div className="text-sm text-[#4a4036] space-y-3">
                  {selectedProduct.prix && (
                    <p className="flex justify-between border-b border-[#ece5dd] pb-2">
                      <strong className="text-[#8c7e71]">Prix :</strong> 
                      <span className="font-bold text-[#cba88c]">{selectedProduct.prix} TND</span>
                    </p>
                  )}
                  {selectedProduct.categorie && (
                    <p className="flex justify-between border-b border-[#ece5dd] pb-2">
                      <strong className="text-[#8c7e71]">Catégorie :</strong> 
                      <span>{selectedProduct.categorie}</span>
                    </p>
                  )}
                  {selectedProduct.description && (
                    <div className="pt-2">
                      <strong className="text-[#8c7e71] block mb-1">Description :</strong>
                      <p className="bg-[#fdfaf6] p-3 rounded-md border border-[#ece5dd] leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedProduct(null)}
                className="w-full mt-6 py-2.5 bg-[#3b332b] text-white font-semibold rounded-md hover:bg-[#2a241e] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Archives;