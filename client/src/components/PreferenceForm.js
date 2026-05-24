import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PreferenceForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // On récupère directement les produits recommandés par l'IA
  const aiProducts = location.state?.aiProducts || [];

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Bouton retour */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 inline-flex items-center bg-white text-black font-black uppercase tracking-widest text-xs px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none"
        >
          ← Retour au profil
        </button>

        <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 rounded-none">
          <h2 className="text-center text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-black">
             Vos recommandations sur-mesure 
          </h2>

          {/* Affichage direct des produits recommandés par l'IA */}
          {aiProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all bg-white cursor-pointer group flex flex-col rounded-none"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="w-full h-80 overflow-hidden bg-[#e6ff00] border-b-4 border-black">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.titre} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-black font-black uppercase tracking-widest text-sm">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h4 className="font-black text-xl uppercase tracking-wider text-black mb-2 line-clamp-2 leading-tight">
                        {product.titre || "Article sans nom"}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.categorie && <span className="text-[10px] font-bold uppercase bg-gray-100 border-2 border-black px-1">{product.categorie}</span>}
                        {product.couleur && <span className="text-[10px] font-bold uppercase bg-[#e6ff00] border-2 border-black px-1">{product.couleur}</span>}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <p className="inline-block font-black text-black text-xl bg-[#e6ff00] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {product.prix} TND
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-16 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto mt-8">
              <p className="font-serif italic text-gray-600 font-bold text-xl mb-10">
                L'IA n'a trouvé aucune création correspondant à vos préférences pour le moment.
              </p>
              <button 
                onClick={() => navigate(-1)}
                className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 rounded-none"
              >
                Retour
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default PreferenceForm;