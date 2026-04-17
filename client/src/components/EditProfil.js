import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function EditProfil() {
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  // --- Champs Communs ---
  const [name, setName] = useState(user?.name || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  
  // --- Champs Spécifiques Client ---
  const [taille, setTaille] = useState(user?.taille || user?.mensurations?.taille || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // --- Champs Spécifiques Styliste ---
  const [nom_marque, setNomMarque] = useState(user?.nom_marque || "");
  const [logo, setLogo] = useState(null);

  // --- Champ partagé ---
  const [adress, setAdress] = useState(user?.adress || "");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("lastname", lastname);
      
      if (user.role === "client") {
        formData.append("taille", taille);
        formData.append("adress", adress);
        formData.append("phone", phone);
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
            Authorization: token,
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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
        <h3 className="text-[#8c7e71] text-lg">Chargement de votre profil...</h3>
      </div>
    );
  }

  // Classes Tailwind réutilisables pour les inputs type "Material Design"
  const inputClass = "w-full border-b border-[#ece5dd] bg-transparent py-2 text-[15px] text-[#4a4036] focus:outline-none focus:border-b-2 focus:border-[#cba88c] transition-colors placeholder-[#c4b9b0]";
  const labelClass = "block text-base font-medium text-[#4a4036] mb-2";
  const cardClass = "bg-white rounded-lg p-6 mb-4 border border-[#ece5dd] shadow-sm flex flex-col gap-6";

  return (
    /* Conteneur principal qui prend au moins toute la hauteur de l'écran avec le fond beige clair */
    <div className="min-h-screen bg-[#fdfaf6] py-10 px-4 font-sans text-[#4a4036]">
      <div className="max-w-2xl mx-auto">
        
        {/* En-tête façon Google Forms (avec la bordure colorée en haut) */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-[#ece5dd] shadow-sm border-t-[10px] border-t-[#cba88c]">
          <h2 className="text-2xl font-normal mb-2 text-[#4a4036]">Mettre à jour mon profil</h2>
          <p className="text-[#8c7e71] text-sm m-0">Modifiez vos informations personnelles ci-dessous.</p>
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
          </div>

          {/* --- Carte : Informations Client --- */}
          {user.role === "client" && (
            <div className={cardClass}>
              <div>
                <label className={labelClass}>Taille</label>
                <input 
                  type="text" 
                  value={taille} 
                  onChange={(e) => setTaille(e.target.value)} 
                  placeholder="Ex: M, L, 38, 40..."
                  className={inputClass}
                />
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
                  className="block w-full text-sm text-[#8c7e71]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border file:border-[#ece5dd]
                    file:text-sm file:font-medium
                    file:bg-[#fdfaf6] file:text-[#4a4036]
                    hover:file:bg-[#f0e9df] file:cursor-pointer transition-colors"
                />
                <span className="block mt-2 text-xs text-[#8c7e71]">
                  Laissez vide si vous ne voulez pas changer votre logo actuel.
                </span>
              </div>
            </div>
          )}

          {/* --- Boutons d'action --- */}
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={() => navigate("/profil")}
              className="px-4 py-2 text-sm font-semibold text-[#b59276] bg-transparent rounded hover:bg-[#f4ece2] transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 text-sm font-semibold text-white bg-[#cba88c] rounded hover:bg-[#b59276] transition-colors shadow-sm"
            >
              Enregistrer les modifications
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProfil;