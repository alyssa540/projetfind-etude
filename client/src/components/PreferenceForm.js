import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PreferenceForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const aiProducts = location.state?.aiProducts || [];

  // --- Listes des choix (identiques à AddProduct) ---
  const styles = ["Minimaliste", "Bohème", "Chic", "Streetwear", "Classique", "Vintage", "Avant-garde"];
  const occasions = ["Casual", "Soirée", "Travail", "Cérémonie", "Sport", "Vacances"];
  const categories = ["Robe", "Haut", "Bas", "Veste/Manteau", "Ensemble", "Accessoire"];

  // --- States pour les filtres ---
  const [categorieFilter, setCategorieFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("");
  const [couleurFilter, setCouleurFilter] = useState(""); // Champ texte libre pour la couleur

  // --- Logique de filtrage ---
  const filteredProducts = aiProducts.filter((product) => {
    const matchCategorie = categorieFilter ? product.categorie === categorieFilter : true;
    const matchStyle = styleFilter ? product.style === styleFilter : true;
    const matchOccasion = occasionFilter ? product.occasion === occasionFilter : true;
    
    // Pour la couleur, on utilise 'includes' pour une recherche partielle insensible à la casse
    const matchCouleur = couleurFilter 
      ? product.couleur?.toLowerCase().includes(couleurFilter.toLowerCase()) 
      : true;

    return matchCategorie && matchStyle && matchOccasion && matchCouleur;
  });

  // --- Classes CSS ---
  const inputClass = "w-full p-3 bg-white border-4 border-black text-black font-bold uppercase text-xs tracking-wider focus:outline-none focus:bg-[#e6ff00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none";
  const labelClass = "block font-black uppercase tracking-widest text-xs mb-2 text-black";

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

          {/* --- SECTION DES FILTRES --- */}
          <div className="mb-12 bg-[#FAF9F7] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black uppercase tracking-widest text-lg mb-6 border-b-4 border-black inline-block pb-2">Affiner les résultats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div>
                <label className={labelClass}>Catégorie</label>
                <select className={inputClass} value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)}>
                  <option value="">Toutes</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Style</label>
                <select className={inputClass} value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
                  <option value="">Tous</option>
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Occasion</label>
                <select className={inputClass} value={occasionFilter} onChange={(e) => setOccasionFilter(e.target.value)}>
                  <option value="">Toutes</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Champ texte libre pour la couleur */}
              <div>
                <label className={labelClass}>Couleur (Taper ici)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Rouge, Noir..." 
                  className={inputClass} 
                  value={couleurFilter} 
                  onChange={(e) => setCouleurFilter(e.target.value)} 
                />
              </div>

            </div>
            
            {/* Bouton pour réinitialiser les filtres */}
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => { setCategorieFilter(""); setStyleFilter(""); setOccasionFilter(""); setCouleurFilter(""); }}
                className="bg-black text-white font-black uppercase text-xs px-4 py-2 border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
          {/* --- FIN SECTION DES FILTRES --- */}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
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
                      {/* Affichage des attributs pour voir le résultat du filtre */}
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
                Aucune création ne correspond à vos filtres.
              </p>
              <button 
                onClick={() => { setCategorieFilter(""); setStyleFilter(""); setOccasionFilter(""); setCouleurFilter(""); }}
                className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 rounded-none"
              >
                Voir tout
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default PreferenceForm;