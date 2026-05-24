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
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
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
        headers: { Authorization: `Bearer ${token}` }
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
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black relative">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-black">Mes Archives</h2>

        {/* --- ONGLETS (TABS) --- */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <button
            onClick={() => setActiveTab("commandes")}
            className={`px-8 py-4 font-black uppercase tracking-widest text-sm border-4 border-black transition-all rounded-none ${
              activeTab === "commandes" 
                ? "bg-[#e6ff00] text-black translate-x-[2px] translate-y-[2px] shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]" 
                : "bg-white text-black hover:bg-black hover:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            Commandes Archivées
          </button>
          <button
            onClick={() => setActiveTab("creations")}
            className={`px-8 py-4 font-black uppercase tracking-widest text-sm border-4 border-black transition-all rounded-none ${
              activeTab === "creations" 
                ? "bg-[#e6ff00] text-black translate-x-[2px] translate-y-[2px] shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]" 
                : "bg-white text-black hover:bg-black hover:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            Créations Archivées
          </button>
        </div>

        {/* --- AFFICHAGE DES COMMANDES ARCHIVÉES --- */}
        {activeTab === "commandes" && (
          <div className="space-y-6">
            {mesCommandes.length === 0 ? (
              <div className="text-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-serif italic text-gray-600 font-bold text-lg">
                  Aucune commande archivée pour le moment.
                </p>
              </div>
            ) : (
              mesCommandes.map((cmd) => (
                <div key={cmd._id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-6 mb-4">
                      {cmd.produitId?.image ? (
                        <img 
                          src={cmd.produitId.image} 
                          alt={cmd.produitId.titre} 
                          className="w-20 h-20 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grayscale hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#e6ff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black font-black uppercase text-xs">Image</div>
                      )}
                      <h4 className="font-black text-xl uppercase tracking-wider text-black m-0">{cmd.produitId?.titre || "Produit inconnu"}</h4>
                    </div>
                    
                    <div className="text-sm font-bold text-black space-y-2 uppercase tracking-wide">
                      <p><span className="text-gray-500 mr-2">Client:</span> {cmd.clientId?.name || ""} {cmd.clientId?.lastname || ""} <span className="lowercase text-xs bg-black text-white px-2 py-1 ml-2">{cmd.clientId?.email}</span></p>
                      <p><span className="text-gray-500 mr-2">Taille:</span> <span className="bg-[#e6ff00] px-2 py-1 border-2 border-black">{cmd.tailleChoisie}</span></p>
                      <p><span className="text-gray-500 mr-2">Statut:</span> <span className="bg-white px-2 py-1 border-2 border-black">{cmd.statut.replace("_", " ")}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <span className="px-4 py-2 bg-white text-black border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                      Commande Archivée
                    </span>
                    <button 
                      onClick={() => setSelectedProduct(cmd.produitId)} 
                      className="w-full sm:w-auto px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
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
          <div className="space-y-6">
            {mesCreations.length === 0 ? (
              <div className="text-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-serif italic text-gray-600 font-bold text-lg">
                  Aucune création archivée pour le moment.
                </p>
              </div>
            ) : (
              mesCreations.map((creation) => (
                <div key={creation._id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-6 mb-4">
                      {creation.image ? (
                        <img 
                          src={creation.image} 
                          alt={creation.titre} 
                          className="w-20 h-20 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grayscale hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#e6ff00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black font-black uppercase text-xs">Image</div>
                      )}
                      <h4 className="font-black text-xl uppercase tracking-wider text-black m-0">{creation.titre}</h4>
                    </div>
                    
                    <div className="text-sm font-bold text-black space-y-2 uppercase tracking-wide">
                      <p><span className="text-gray-500 mr-2">Catégorie:</span> <span className="bg-white px-2 py-1 border-2 border-black">{creation.categorie || "Non spécifiée"}</span></p>
                      <p><span className="text-gray-500 mr-2">Prix:</span> <span className="bg-[#e6ff00] px-3 py-1 border-2 border-black font-black">{creation.prix} TND</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <span className="hidden lg:block px-4 py-2 bg-white text-black border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                      Création Archivée
                    </span>
                    
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => handleUnarchive(creation._id)} 
                        className="flex-1 sm:flex-none px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-[#e6ff00] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
                      >
                        Désarchiver 
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(creation)} 
                        className="flex-1 sm:flex-none px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap"
                      >
                        Détails
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div 
              className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg p-0 relative rounded-none flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute -top-6 -right-6 bg-[#e6ff00] border-4 border-black text-black w-14 h-14 flex items-center justify-center font-black text-2xl hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
              >
                &times;
              </button>

              <div className="bg-[#e6ff00] px-8 py-6 border-b-4 border-black">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-black m-0 pr-6 truncate">
                  {selectedProduct.titre}
                </h3>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                {selectedProduct.image && (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.titre} 
                    className="w-full h-64 object-cover bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 grayscale hover:grayscale-0 transition-all"
                  />
                )}

                <div className="text-sm font-bold text-black space-y-4 uppercase tracking-wider">
                  {selectedProduct.prix && (
                    <p className="flex justify-between items-center border-b-4 border-black pb-3">
                      <strong className="text-gray-500">Prix :</strong> 
                      <span className="font-black bg-[#e6ff00] px-3 py-1 border-2 border-black">{selectedProduct.prix} TND</span>
                    </p>
                  )}
                  {selectedProduct.categorie && (
                    <p className="flex justify-between items-center border-b-4 border-black pb-3">
                      <strong className="text-gray-500">Catégorie :</strong> 
                      <span>{selectedProduct.categorie}</span>
                    </p>
                  )}
                  {selectedProduct.description && (
                    <div className="pt-2">
                      <strong className="text-gray-500 block mb-3">Description :</strong>
                      <p className="bg-white p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] leading-relaxed font-serif italic normal-case text-base">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-full mt-10 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Archives;