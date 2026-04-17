import React, { useState } from "react";
import axios from "axios";

const PreferenceForm = () => {
  // 1. Les states bech nخبiw fihom les données
  const [preferences, setPreferences] = useState({
    style: "casual", // valeur par défaut
    couleur: "",
    occasion: "tous les jours",
  });
  
  const [loading, setLoading] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState([]);

  // 2. Fonction bech tbaddel les valeurs wa9t l'client yekteb
  const handleChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  // 3. Fonction bech tebaath les données lel Backend (w l'OpenAI)
  const getRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ⚠️ Badel l'URL ken l'port mte3ek mouch 5000
      const response = await axios.post("http://localhost:5000/api/recommendations", {
        preferences: preferences
      });
      
      console.log("Réponse AI:", response.data);
      
      // Nsajlou l'IDs mtaa l'produits elli rja3 bihom l'AI
      if (response.data.recommended_ids) {
        setRecommendedIds(response.data.recommended_ids);
        alert("L'AI a trouvé des articles pour vous ! (Vérifiez la console)");
      }
      
    } catch (error) {
      console.error("Erreur lors de la recommandation:", error);
      alert("Une erreur s'est produite avec l'Intelligence Artificielle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>✨ Trouvez votre style avec notre IA</h2>
      <p>Dites-nous ce que vous aimez, notre styliste virtuel s'occupe du reste !</p>

      <form onSubmit={getRecommendations}>
        <div style={{ marginBottom: "15px" }}>
          <label>Style préféré :</label>
          <select name="style" value={preferences.style} onChange={handleChange} style={{ width: "100%", padding: "8px", marginTop: "5px" }}>
            <option value="casual">Casual / Décontracté</option>
            <option value="chic">Chic / Élégant</option>
            <option value="sportwear">Sportwear</option>
            <option value="vintage">Vintage</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Couleurs préférées :</label>
          <input 
            type="text" 
            name="couleur" 
            placeholder="Ex: Noir, Rouge, Pastel..." 
            value={preferences.couleur} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Pour quelle occasion ?</label>
          <input 
            type="text" 
            name="occasion" 
            placeholder="Ex: Soirée, Travail, Mariage..." 
            value={preferences.occasion} 
            onChange={handleChange} 
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: "10px 20px", backgroundColor: "#000", color: "#fff", cursor: "pointer", width: "100%" }}
        >
          {loading ? "L'IA réfléchit... 🧠" : "Demander à l'IA 🪄"}
        </button>
      </form>

      {/* Partie provisoire bech nchoufou les IDs elli rja3 bihom l'AI */}
      {recommendedIds.length > 0 && (
        <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f0f0" }}>
          <h3>🎉 IDs recommandés par l'IA :</h3>
          <ul>
            {recommendedIds.map((id, index) => (
              <li key={index}>{id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PreferenceForm;