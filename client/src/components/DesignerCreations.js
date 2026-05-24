import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function DesignerCreations() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user?.user);

  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/admin/stylistes/${id}/creations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCreations(res.data.creations || res.data.produits || []);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des créations:", error);
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchCreations();
    }
  }, [id, currentUser]);

  const handleDelete = async (creationId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette création ?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/creations/${creationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCreations(creations.filter((c) => c._id !== creationId));
        alert("Création supprimée avec succès.");
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-black px-6">
        <div className="bg-red-500 border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Accès refusé</h2>
          <p className="font-bold text-lg uppercase tracking-widest text-black">Espace réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-4 sm:px-8 lg:px-16 font-sans text-black relative">
      <div className="w-full max-w-[98vw] mx-auto">
        
        <button
          onClick={() => navigate("/admin/users")}
          className="mb-12 inline-flex items-center bg-white text-black font-black uppercase tracking-widest text-sm px-6 py-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none"
        >
          ⬅ Retour aux utilisateurs
        </button>

        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 text-black">
          Créations du Designeur
        </h2>
        <p className="font-bold text-gray-600 mb-16 uppercase tracking-widest text-sm md:text-base border-l-8 border-[#e6ff00] pl-4">
          Gérez et consultez les articles publiés par ce profil.
        </p>

        {loading ? (
          <div className="w-full bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse flex justify-center">
            <h2 className="text-2xl font-black uppercase tracking-widest">Chargement des créations...</h2>
          </div>
        ) : creations.length === 0 ? (
          <div className="text-center p-16 bg-[#e6ff00] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full mx-auto">
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-black">Aucune création trouvée.</h3>
            <p className="font-bold uppercase tracking-widest text-black text-lg md:text-xl">Ce designeur n'a pas encore publié d'articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {creations.map((item) => (
              <div 
                key={item._id} 
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all overflow-hidden flex flex-col rounded-none group"
              >
                <div className="h-64 bg-[#e6ff00] relative border-b-4 border-black overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.nom || item.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black uppercase tracking-widest text-black text-sm">
                      [Pas d'image]
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow bg-white">
                  <h3 className="font-black text-2xl uppercase tracking-wider text-black mb-2 line-clamp-1 break-words">
                    {item.nom || item.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide line-clamp-3 mb-8">
                    {item.description || "Aucune description fournie."}
                  </p>
                  
                  <div className="mt-auto flex items-end justify-between gap-4">
                    <span className="inline-block bg-black text-white px-3 py-2 font-black text-xl shadow-[4px_4px_0px_0px_rgba(230,255,0,1)]">
                      {item.prix || item.price} TND
                    </span>
                    
                    {/*<button
                      onClick={() => handleDelete(item._id)}
                      className="px-4 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-xs border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none"
                    >
                      Supprimer
                    </button>*/}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignerCreations;