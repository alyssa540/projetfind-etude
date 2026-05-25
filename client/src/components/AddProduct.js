import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddProduct() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [mesCreations, setMesCreations] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Nouveaux states pour les inputs de couleurs personnalisées
  const [couleurInput, setCouleurInput] = useState("");
  const [editCouleurInput, setEditCouleurInput] = useState("");

  const styles = ["Minimaliste", "Bohème", "Chic", "Streetwear", "Classique", "Vintage", "Avant-garde"];
  const occasions = ["Casual", "Soirée", "Travail", "Cérémonie", "Sport", "Vacances"];
  const categories = ["Robe", "Haut", "Bas", "Veste/Manteau", "Ensemble", "Accessoire"];

  useEffect(() => {
    if (user && user.role === 'styliste') {
      const fetchMesCreations = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/products/all");
          const mesProduits = res.data.products.filter((product) => {
            const idCreateurDuProduit = product.stylisteId?._id || product.stylisteId;
            return String(idCreateurDuProduit) === String(user._id) && product.estArchivee !== true;
          });
          setMesCreations(mesProduits);
        } catch (error) {
          console.error("Erreur lors de la récupération des créations :", error);
        }
      };
      fetchMesCreations();
    }
  }, [user]);

  const [product, setProduct] = useState({
    titre: "",
    description: "",
    prix: "",
    image: "",
    taillesDisponibles: [],
    style: "",
    couleurs: [],
    occasion: "",
    categorie: "",
  });

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (isEditing) {
          setEditingProduct({ ...editingProduct, image: reader.result });
        } else {
          setProduct({ ...product, image: reader.result });
        }
      };
    }
  };

  const handleSizeChange = (e, isEditing = false) => {
    const taille = e.target.value;
    const isChecked = e.target.checked;

    if (isEditing) {
      if (isChecked) {
        setEditingProduct({ ...editingProduct, taillesDisponibles: [...(editingProduct.taillesDisponibles || []), taille] });
      } else {
        setEditingProduct({
          ...editingProduct,
          taillesDisponibles: editingProduct.taillesDisponibles.filter((t) => t !== taille),
        });
      }
    } else {
      if (isChecked) {
        setProduct({ ...product, taillesDisponibles: [...product.taillesDisponibles, taille] });
      } else {
        setProduct({
          ...product,
          taillesDisponibles: product.taillesDisponibles.filter((t) => t !== taille),
        });
      }
    }
  };

  const handleAddColor = (e, isEditing = false) => {
    e.preventDefault();
    if (isEditing) {
      if (editCouleurInput.trim() && !(editingProduct.couleurs || []).includes(editCouleurInput.trim())) {
        setEditingProduct({ 
          ...editingProduct, 
          couleurs: [...(editingProduct.couleurs || []), editCouleurInput.trim()] 
        });
        setEditCouleurInput("");
      }
    } else {
      if (couleurInput.trim() && !product.couleurs.includes(couleurInput.trim())) {
        setProduct({ ...product, couleurs: [...product.couleurs, couleurInput.trim()] });
        setCouleurInput("");
      }
    }
  };

  const handleRemoveColor = (colorToRemove, isEditing = false) => {
    if (isEditing) {
      setEditingProduct({
        ...editingProduct,
        couleurs: (editingProduct.couleurs || []).filter((c) => c !== colorToRemove)
      });
    } else {
      setProduct({
        ...product,
        couleurs: product.couleurs.filter((c) => c !== colorToRemove)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/products/add",
        product,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMesCreations([...mesCreations, res.data.product]);
      setProduct({ titre: "", description: "", prix: "", image: "", taillesDisponibles: [], style: "", couleurs: [], occasion: "", categorie: "" });
      setCouleurInput("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout de la création. (Vérifiez la taille de l'image)");
    }
  };

  const handleArchiveProduct = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir archiver cette création ? Elle n'apparaîtra plus dans le catalogue.")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/products/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMesCreations(mesCreations.filter((creation) => creation._id !== id));
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'archivage.");
    }
  };

  const openEditModal = (creation) => {
    const formattedCreation = {
      ...creation,
      couleurs: Array.isArray(creation.couleurs) ? creation.couleurs : (creation.couleur ? [creation.couleur] : [])
    };
    setEditingProduct(formattedCreation);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        editingProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMesCreations(mesCreations.map((c) => (c._id === editingProduct._id ? res.data.product : c)));
      setIsModalOpen(false);
      setEditingProduct(null);
      setEditCouleurInput("");
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification.");
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] font-sans">
        <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4">Accès refusé</h2>
        <p className="font-serif italic text-xl text-gray-800 mb-8">Espace réservé aux créateurs.</p>
        <button 
          className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          onClick={() => navigate("/")}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const inputClass = "w-full p-4 bg-white border-4 border-black text-black font-bold uppercase text-sm tracking-wider focus:outline-none focus:bg-[#e6ff00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none";
  const labelClass = "block font-black uppercase tracking-widest text-sm mb-2 mt-6 text-black";
  const fileInputClass = "w-full text-sm text-black font-bold uppercase file:mr-4 file:py-3 file:px-4 file:border-r-4 file:border-black file:border-y-0 file:border-l-0 file:text-sm file:font-black file:uppercase file:bg-[#e6ff00] file:text-black hover:file:bg-black hover:file:text-white file:cursor-pointer transition-colors border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white rounded-none";

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black relative">
      <div className="max-w-7xl mx-auto">
        
        {/* --- FORMULAIRE D'AJOUT --- */}
        <div className="max-w-3xl mx-auto bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 mb-24 relative">
          
          <div className="absolute -top-6 -left-6 bg-[#e6ff00] border-4 border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter m-0 text-black">Nouvelle Création</h2>
          </div>

          <div className="mb-8 mt-4">
            <p className="font-serif italic text-gray-600 font-bold text-lg">Ajoutez les détails pour améliorer les recommandations et enrichir votre catalogue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Nom de la création</label>
              <input
                type="text"
                placeholder="Ex: Robe en Lin Minimaliste"
                required
                className={inputClass}
                value={product.titre}
                onChange={(e) => setProduct({ ...product, titre: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                placeholder="Description détaillée du vêtement..."
                required
                rows="3"
                className={`${inputClass} resize-y`}
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Catégorie</label>
                <select required className={inputClass} value={product.categorie} onChange={(e) => setProduct({ ...product, categorie: e.target.value })}>
                  <option value="" disabled>Choisir une catégorie</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Style</label>
                <select required className={inputClass} value={product.style} onChange={(e) => setProduct({ ...product, style: e.target.value })}>
                  <option value="" disabled>Choisir un style</option>
                  {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Couleurs</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Bleu Marine"
                    className={`${inputClass} flex-1`}
                    value={couleurInput}
                    onChange={(e) => setCouleurInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor(e, false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddColor(e, false)}
                    className="px-4 py-2 bg-black text-white font-black uppercase text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Ajouter
                  </button>
                </div>
                
                {product.couleurs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {product.couleurs.map((couleur, index) => (
                      <span key={index} className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {couleur}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveColor(couleur, false)}
                          className="text-red-500 hover:text-black text-lg leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Occasion</label>
                <select required className={inputClass} value={product.occasion} onChange={(e) => setProduct({ ...product, occasion: e.target.value })}>
                  <option value="" disabled>Choisir une occasion</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/3">
                <label className={labelClass}>Prix (TND)</label>
                <input
                  type="number"
                  placeholder="Ex: 120"
                  required
                  className={inputClass}
                  value={product.prix}
                  onChange={(e) => setProduct({ ...product, prix: e.target.value })}
                />
              </div>

              {/* --- UPDATE: GESTION DU DOUBLE SUPPORTS IMAGE (FILE OU URL) --- */}
              <div className="w-full sm:w-2/3">
                <label className={labelClass}>Image de la création</label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    className={fileInputClass}
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <div className="text-center font-black text-xs uppercase tracking-widest text-gray-500 my-1">— OU RECOPIER L'URL —</div>
                  <input
                    type="text"
                    placeholder="Coller l'URL de l'image ici..."
                    className={inputClass}
                    value={product.image.startsWith("data:image") ? "" : product.image}
                    onChange={(e) => setProduct({ ...product, image: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {product.image && (
              <div className="flex justify-center mt-6">
                <img src={product.image} alt="Aperçu" className="max-w-[250px] h-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] object-cover" />
              </div>
            )}

            <div>
              <label className={labelClass}>Tailles disponibles</label>
              <div className="flex gap-4 flex-wrap mt-2">
                {["XS", "S", "M", "L", "XL"].map((taille) => (
                  <label key={taille} className="cursor-pointer flex items-center relative">
                    <input 
                      type="checkbox" 
                      value={taille} 
                      onChange={(e) => handleSizeChange(e, false)} 
                      checked={product.taillesDisponibles.includes(taille)}
                      className="hidden peer"
                    />
                    <span className="w-12 h-12 flex items-center justify-center bg-white border-4 border-black text-black font-black uppercase tracking-widest peer-checked:bg-[#e6ff00] peer-checked:translate-x-[2px] peer-checked:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] peer-checked:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                      {taille}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-10 py-5 bg-black text-white font-black uppercase tracking-widest text-lg border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Publier ma création
            </button>
          </form>
        </div>

        {/* --- PORTFOLIO EN CARTES --- */}
        <div>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-12 border-b-8 border-black pb-4 text-black inline-block">Mon Portfolio</h3>
          
          {mesCreations.length === 0 ? (
            <div className="text-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center max-w-2xl mx-auto">
              <h4 className="text-2xl font-black uppercase mb-4 text-black tracking-widest">Aucune création</h4>
              <p className="font-serif italic text-gray-600 font-bold">Vous n'avez pas encore ajouté de créations actives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {mesCreations.map((creation) => (
                <div key={creation._id} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all group">
                  
                  <div className="relative h-72 border-b-4 border-black overflow-hidden bg-white">
                    <img 
                      src={creation.image || "https://via.placeholder.com/300x400"} 
                      alt={creation.titre} 
                      className="w-full h-full object-cover " 
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h4 className="font-black text-xl uppercase tracking-wider mb-3 text-black line-clamp-2 leading-tight">
                        {creation.titre}
                      </h4>
                      <div className="font-black text-2xl bg-[#e6ff00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mb-5">
                        {creation.prix} TND
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {creation.categorie && <span className="text-xs font-bold uppercase tracking-wider bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{creation.categorie}</span>}
                        {creation.style && <span className="text-xs font-bold uppercase tracking-wider bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{creation.style}</span>}
                        {(creation.couleurs && creation.couleurs.length > 0) && (
                           <span className="text-xs font-bold uppercase tracking-wider bg-black text-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+{creation.couleurs.length} Coul.</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t-4 border-black gap-3">
                      <button 
                        onClick={() => openEditModal(creation)} 
                        className="flex-1 py-2 bg-white text-black font-black uppercase text-xs border-2 border-black "
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleArchiveProduct(creation._id)} 
                        className="flex-1 py-2 bg-black text-white font-black uppercase text-xs border-2 border-black hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Archiver
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- MODAL DE MODIFICATION --- */}
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl max-h-[90vh] flex flex-col relative rounded-none">
              
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute -top-6 -right-6 bg-[#e6ff00] border-4 border-black text-black w-14 h-14 flex items-center justify-center font-black text-2xl hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
              >
                &times;
              </button>

              <div className="px-8 py-6 border-b-4 border-black bg-[#e6ff00]">
                <h2 className="text-3xl font-black uppercase tracking-tighter m-0 text-black">Modifier la Création</h2>
              </div>

              <div className="p-8 overflow-y-auto">
                {editingProduct.image && (
                  <div className="mb-8 flex justify-center">
                    <img src={editingProduct.image} alt={editingProduct.titre} className="max-w-full h-56 object-cover border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
                  </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className={labelClass}>Nom de l'article</label>
                    <input
                      type="text"
                      required
                      className={inputClass}
                      value={editingProduct.titre}
                      onChange={(e) => setEditingProduct({ ...editingProduct, titre: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      required
                      rows="3"
                      className={`${inputClass} resize-y`}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Catégorie</label>
                      <select required className={inputClass} value={editingProduct.categorie || ""} onChange={(e) => setEditingProduct({ ...editingProduct, categorie: e.target.value })}>
                        <option value="" disabled>Choisir</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Style</label>
                      <select required className={inputClass} value={editingProduct.style || ""} onChange={(e) => setEditingProduct({ ...editingProduct, style: e.target.value })}>
                        <option value="" disabled>Choisir</option>
                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className={labelClass}>Couleurs</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ajouter une couleur..."
                          className={`${inputClass} flex-1`}
                          value={editCouleurInput}
                          onChange={(e) => setEditCouleurInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddColor(e, true);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => handleAddColor(e, true)}
                          className="px-4 py-2 bg-black text-white font-black uppercase text-sm border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          +
                        </button>
                      </div>
                      
                      {(editingProduct.couleurs && editingProduct.couleurs.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {editingProduct.couleurs.map((couleur, index) => (
                            <span key={index} className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {couleur}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveColor(couleur, true)}
                                className="text-red-500 hover:text-black text-lg leading-none"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Occasion</label>
                      <select required className={inputClass} value={editingProduct.occasion || ""} onChange={(e) => setEditingProduct({ ...editingProduct, occasion: e.target.value })}>
                        <option value="" disabled>Choisir</option>
                        {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-1/3">
                      <label className={labelClass}>Prix (TND)</label>
                      <input
                        type="number"
                        required
                        className={inputClass}
                        value={editingProduct.prix}
                        onChange={(e) => setEditingProduct({ ...editingProduct, prix: e.target.value })}
                      />
                    </div>

                    {/* --- UPDATE MODAL: DOUBLE CHANCE IMAGE AUSSI --- */}
                    <div className="w-full sm:w-2/3">
                      <label className={labelClass}>Changer l'image</label>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          className={fileInputClass}
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                        <div className="text-center font-black text-xs uppercase tracking-widest text-gray-500 my-1">— OU PAR URL —</div>
                        <input
                          type="text"
                          placeholder="Changer l'URL de l'image..."
                          className={inputClass}
                          value={editingProduct.image?.startsWith("data:image") ? "" : editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Tailles disponibles</label>
                    <div className="flex gap-4 flex-wrap mt-2">
                      {["XS", "S", "M", "L", "XL"].map((taille) => (
                        <label key={taille} className="cursor-pointer flex items-center relative">
                          <input 
                            type="checkbox" 
                            value={taille} 
                            onChange={(e) => handleSizeChange(e, true)} 
                            checked={editingProduct.taillesDisponibles?.includes(taille) || false}
                            className="hidden peer"
                          />
                          <span className="w-12 h-12 flex items-center justify-center bg-white border-4 border-black text-black font-black uppercase tracking-widest peer-checked:bg-black peer-checked:text-white peer-checked:translate-x-[2px] peer-checked:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] peer-checked:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                            {taille}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-10 py-5 bg-black text-white font-black uppercase tracking-widest text-lg border-4 border-black hover:bg-[#e6ff00] hover:text-black transition-all hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    Enregistrer les modifications
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AddProduct;