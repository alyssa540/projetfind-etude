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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/products/add",
        product,
        { headers: { Authorization: token } }
      );
    
      setMesCreations([...mesCreations, res.data.product]);
      setProduct({ titre: "", description: "", prix: "", image: "", taillesDisponibles: [] });
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
        headers: { Authorization: token },
      });
      setMesCreations(mesCreations.filter((creation) => creation._id !== id));
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'archivage.");
    }
  };

  const openEditModal = (creation) => {
    setEditingProduct(creation);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        editingProduct,
        { headers: { Authorization: token } }
      );
      
      setMesCreations(mesCreations.map((c) => (c._id === editingProduct._id ? res.data.product : c)));
      setIsModalOpen(false);
      setEditingProduct(null);
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification.");
    }
  };

  if (user?.role !== "styliste") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#fdfaf6] font-sans">
        <h2 className="text-[#3b332b] font-light text-2xl mb-2">Accès refusé</h2>
        <p className="text-[#8c7e71]">Espace réservé aux créateurs.</p>
      </div>
    );
  }

  // Classes réutilisables pour les inputs
  const inputClass = "w-full p-2.5 border border-[#ece5dd] rounded-md focus:outline-none focus:border-[#cba88c] focus:ring-1 focus:ring-[#cba88c] transition-colors bg-[#fdfaf6] text-[#3b332b] text-sm";
  const labelClass = "block text-sm font-medium text-[#4a4036] mb-1.5";
  const fileInputClass = "w-full text-sm text-[#8c7e71] file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#f4ece2] file:text-[#cba88c] hover:file:bg-[#ece5dd] file:cursor-pointer transition-colors border border-[#ece5dd] rounded-md bg-[#fdfaf6]";

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#3b332b]">
      <div className="max-w-6xl mx-auto">
        
        {/* --- FORMULAIRE D'AJOUT --- */}
        <div className="max-w-2xl mx-auto bg-white border border-[#ece5dd] rounded-xl shadow-sm p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#3b332b] mb-2">Nouvelle Création</h2>
            <p className="text-[#8c7e71] text-sm">Ajoutez les détails de votre nouvelle pièce à votre collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Description détaillée du vêtement, de la matière, etc."
                required
                rows="3"
                className={`${inputClass} resize-none`}
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
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

              <div className="w-full sm:w-2/3">
                <label className={labelClass}>Importer une image</label>
                <input
                  type="file"
                  accept="image/*"
                  className={fileInputClass}
                  onChange={(e) => handleImageUpload(e, false)}
                />
              </div>
            </div>

            {/* PREVIEW DE L'IMAGE AJOUTÉE */}
            {product.image && (
              <div className="flex justify-center mt-4">
                <img src={product.image} alt="Aperçu" className="max-w-[200px] h-auto rounded-lg border border-[#ece5dd] object-cover shadow-sm" />
              </div>
            )}

            <div>
              <label className={labelClass}>Tailles disponibles</label>
              <div className="flex gap-3 flex-wrap">
                {["XS", "S", "M", "L", "XL"].map((taille) => (
                  <label key={taille} className="cursor-pointer flex items-center">
                    <input 
                      type="checkbox" 
                      value={taille} 
                      onChange={(e) => handleSizeChange(e, false)} 
                      checked={product.taillesDisponibles.includes(taille)}
                      className="hidden peer"
                    />
                    <span className="px-4 py-2 bg-[#fdfaf6] border border-[#ece5dd] rounded-md text-sm text-[#8c7e71] font-medium peer-checked:bg-[#cba88c] peer-checked:text-white peer-checked:border-[#cba88c] transition-all hover:bg-[#f4ece2] peer-checked:hover:bg-[#b59276]">
                      {taille}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full mt-4 py-3 bg-[#cba88c] text-white font-semibold rounded-md hover:bg-[#b59276] transition-colors shadow-sm">
              Publier ma création
            </button>
          </form>
        </div>

        {/* --- PORTFOLIO EN CARTES --- */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 border-b-2 border-[#ece5dd] pb-3 text-[#3b332b]">Mon Portfolio</h3>
          
          {mesCreations.length === 0 ? (
            <p className="text-center text-[#8c7e71] py-10 bg-white border border-[#ece5dd] rounded-xl border-dashed">
              Vous n'avez pas encore ajouté de créations actives.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mesCreations.map((creation) => (
                <div key={creation._id} className="bg-white border border-[#ece5dd] rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow group">
                  <div className="relative h-64 overflow-hidden bg-[#fdfaf6]">
                    <img 
                      src={creation.image || "https://via.placeholder.com/300x400"} 
                      alt={creation.titre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-[#3b332b] mb-1 truncate">{creation.titre}</h4>
                      <p className="font-bold text-[#cba88c] mb-4">{creation.prix} TND</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-[#ece5dd]">
                      <button 
                        onClick={() => openEditModal(creation)} 
                        className="text-sm font-semibold text-[#8c7e71] hover:text-[#cba88c] transition-colors"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleArchiveProduct(creation._id)} 
                        className="text-sm font-semibold text-[#b86b6b] hover:text-[#9a5555] transition-colors"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="flex justify-between items-center px-6 py-4 border-b border-[#ece5dd] bg-[#fdfaf6] rounded-t-xl">
                <h2 className="text-xl font-semibold text-[#3b332b] m-0">Modifier la Création</h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-3xl text-[#8c7e71] hover:text-[#b86b6b] transition-colors leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {editingProduct.image && (
                  <div className="mb-6 flex justify-center">
                    <img src={editingProduct.image} alt={editingProduct.titre} className="max-w-full h-48 object-contain rounded-lg bg-[#fdfaf6] border border-[#ece5dd]" />
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
                      className={`${inputClass} resize-none`}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
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
                    <div className="w-full sm:w-2/3">
                      <label className={labelClass}>Changer l'image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className={fileInputClass}
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Tailles disponibles</label>
                    <div className="flex gap-2 flex-wrap">
                      {["XS", "S", "M", "L", "XL"].map((taille) => (
                        <label key={taille} className="cursor-pointer flex items-center">
                          <input 
                            type="checkbox" 
                            value={taille} 
                            onChange={(e) => handleSizeChange(e, true)} 
                            checked={editingProduct.taillesDisponibles?.includes(taille) || false}
                            className="hidden peer"
                          />
                          <span className="px-3 py-1.5 bg-[#fdfaf6] border border-[#ece5dd] rounded-md text-sm text-[#8c7e71] peer-checked:bg-[#cba88c] peer-checked:text-white peer-checked:border-[#cba88c] transition-all hover:bg-[#f4ece2]">
                            {taille}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-6 py-3 bg-[#6b8e6b] text-white font-semibold rounded-md hover:bg-[#5a7a5a] transition-colors shadow-sm">
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