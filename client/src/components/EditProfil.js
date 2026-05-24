import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const STYLES = ["casual", "chic", "streetwear", "élégant", "sport"];
const OCCASIONS = ["tous les jours", "soirée", "travail", "sortie"];
const TAILLES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function EditProfil() {
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  // --- Champs Communs ---
  const [name, setName] = useState(user?.name || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [phone, setPhone] = useState(user?.phone || ""); // Déplacé dans les champs communs
  
  // --- Champs Spécifiques Client (avec valeur par défaut "M" si vide) ---
  const [taille, setTaille] = useState(user?.taille || user?.mensurations?.taille || "M");

  // --- Champs Spécifiques Styliste ---
  const [nom_marque, setNomMarque] = useState(user?.nom_marque || "");
  const [logo, setLogo] = useState(null);

  // --- Champ partagé (Adresse) ---
  const [adress, setAdress] = useState(user?.adress || "");

  // --- Préférences Style (clients uniquement) ---
  const [prefStyle, setPrefStyle] = useState(user?.preferences?.style || "casual");
  const [prefCouleurs, setPrefCouleurs] = useState(user?.preferences?.couleurs || "");
  const [prefOccasion, setPrefOccasion] = useState(user?.preferences?.occasion || "tous les jours");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      // Champs communs à tous les utilisateurs
      formData.append("name", name);
      formData.append("lastname", lastname);
      formData.append("phone", phone); 
      
      if (user.role === "client") {
        formData.append("taille", taille);
        formData.append("adress", adress);
        formData.append("style", prefStyle);
        formData.append("couleurs", prefCouleurs);
        formData.append("occasion", prefOccasion);
      } else if (user.role === "styliste") {
        formData.append("nom_marque", nom_marque);
        formData.append("adress", adress);
        if (logo) {
          formData.append("logo", logo);
        }
      }

      await axios.put(
        "http://localhost:5000/api/auth/update-profile", 
        formData, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          } 
        }
      );

      window.location.href = "/profil"; 
      
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-6 font-sans">
        <h3 className="text-2xl font-black uppercase tracking-widest text-black animate-pulse">Chargement...</h3>
      </div>
    );
  }

  // Classes Tailwind réutilisables façon "Brutalist"
  const inputClass = "w-full p-4 bg-white border-2 border-black text-black font-bold uppercase text-sm focus:outline-none focus:bg-[#e6ff00] transition-colors placeholder:text-gray-400 rounded-none";
  const labelClass = "block text-xs font-black text-black uppercase tracking-widest mb-2";
  const cardClass = "bg-white p-8 md:p-10 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6";

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête Brutalist */}
        <div className="bg-[#e6ff00] p-8 md:p-10 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter m-0 mb-4 text-black">Mettre à jour</h2>
          <p className="font-serif italic text-xl text-gray-700 m-0 border-l-4 border-black pl-4">Modifiez vos informations personnelles ci-dessous.</p>
        </div>

        <form onSubmit={handleUpdate}>
          
          {/* --- Carte : Informations Communes --- */}
          <div className={cardClass}>
            <div>
              <label className={labelClass}>Prénom</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Votre prénom"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Nom</label>
              <input 
                type="text" 
                value={lastname} 
                onChange={(e) => setLastname(e.target.value)} 
                placeholder="Votre nom de famille"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Numéro de téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 21 345 678"
                className={inputClass}
              />
            </div>
          </div>

          {/* --- Carte : Informations Client --- */}
          {user.role === "client" && (
            <div className={cardClass}>
              {/* SÉLECTEUR DE TAILLE */}
              <div>
                <label className={labelClass}>Sélectionnez votre taille</label>
                <div className="flex flex-wrap gap-2">
                  {TAILLES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaille(t)}
                      className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wide transition-all ${
                        taille === t
                          ? "bg-[#e6ff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Adresse complète</label>
                <input
                  type="text"
                  value={adress}
                  onChange={(e) => setAdress(e.target.value)}
                  placeholder="Numéro, rue, ville..."
                  className={inputClass}
                />
              </div>

              {/* --- Préférences Style --- */}
              <div className="pt-6 border-t-2 border-dashed border-black">
                <h3 className="text-lg font-black uppercase tracking-widest text-black mb-6">
                  Préférences Style
                </h3>

                <div className="flex flex-col gap-6">
                  <div>
                    <label className={labelClass}>Style vestimentaire</label>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPrefStyle(s)}
                          className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wide transition-all ${
                            prefStyle === s
                              ? "bg-[#e6ff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Couleurs préférées</label>
                    <input
                      type="text"
                      value={prefCouleurs}
                      onChange={(e) => setPrefCouleurs(e.target.value)}
                      placeholder="ex: noir, blanc, bleu..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Occasion principale</label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setPrefOccasion(o)}
                          className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wide transition-all ${
                            prefOccasion === o
                              ? "bg-[#e6ff00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Carte : Informations Styliste --- */}
          {user.role === "styliste" && (
            <div className={cardClass}>
              <div>
                <label className={labelClass}>Nom de la Marque</label>
                <input 
                  type="text" 
                  value={nom_marque} 
                  onChange={(e) => setNomMarque(e.target.value)} 
                  placeholder="Ex: Sara Design"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Adresse de l'Atelier / Boutique</label>
                <input 
                  type="text" 
                  value={adress} 
                  onChange={(e) => setAdress(e.target.value)} 
                  placeholder="Lieu de votre atelier"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Logo de la marque</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files[0])} 
                  className="block w-full text-sm text-black bg-white border-2 border-black p-2
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-none file:border-2 file:border-black
                    file:text-xs file:font-black file:uppercase file:tracking-widest
                    file:bg-black file:text-white
                    hover:file:bg-[#e6ff00] hover:file:text-black file:transition-colors file:cursor-pointer"
                />
                <span className="block mt-3 text-sm font-serif italic text-gray-500">
                  Laissez vide si vous ne voulez pas changer votre logo actuel.
                </span>
              </div>
            </div>
          )}

          {/* --- Boutons d'action --- */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button 
              type="button" 
              onClick={() => navigate("/profil")}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-red-500 hover:text-white transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
            >
              Enregistrer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProfil;