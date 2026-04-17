import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux"; 
import { addToCart } from "../JS/cartSlice/cartSlice"; 
import { useLocation } from "react-router-dom";

// --- SOUS-COMPOSANT PRODUCT CARD ---
const ProductCard = ({ product, user }) => {
  const dispatch = useDispatch();
  
  const [selectedSize, setSelectedSize] = useState(
    product.taillesDisponibles && product.taillesDisponibles.length > 0 
      ? product.taillesDisponibles[0] 
      : "Standard"
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addToCart({ 
      produit: product, 
      taille: selectedSize, 
      quantite: selectedQuantity 
    }));
    alert(`Ajouté au panier ! (${selectedQuantity}x taille ${selectedSize})`);
    
    setSelectedQuantity(1);
  };

  return (
    <div id={product._id} className="group bg-white rounded-xl shadow-sm border border-[#ece5dd] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image du produit */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f4ece2]">
        <img 
          src={product.image || "https://via.placeholder.com/300"} 
          alt={product.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      {/* Infos du produit */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-bold text-[#3b332b] truncate" title={product.titre}>
            {product.titre}
          </h3>
          <span className="text-lg font-bold text-[#cba88c] whitespace-nowrap">
            {product.prix} TND
          </span>
        </div>
        
        <p className="text-sm text-[#8c7e71] line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        {/* Contrôles Client (Taille, Qté, Bouton) */}
        {user?.role === "client" && (
          <div className="mt-auto space-y-4 border-t border-[#ece5dd] pt-4">
            
            <div className="flex items-center justify-between gap-4">
              {/* Sélecteur de taille */}
              {product.taillesDisponibles && product.taillesDisponibles.length > 0 ? (
                <div className="flex-1">
                  <select 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 text-sm bg-[#fdfaf6] border border-[#ece5dd] text-[#4a4036] rounded-md focus:outline-none focus:border-[#cba88c] cursor-pointer"
                  >
                    {product.taillesDisponibles.map(taille => (
                      <option key={taille} value={taille}>{taille}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1 text-sm text-[#8c7e71] italic">Taille unique</div>
              )}

              {/* Sélecteur de quantité */}
              <div className="flex items-center bg-[#fdfaf6] border border-[#ece5dd] rounded-md h-[38px]">
                <button 
                  onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 text-[#8c7e71] hover:text-[#3b332b] transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-[#3b332b]">
                  {selectedQuantity}
                </span>
                <button 
                  onClick={() => setSelectedQuantity(prev => prev + 1)}
                  className="px-3 text-[#8c7e71] hover:text-[#3b332b] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Bouton d'ajout */}
            <button 
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-[#3b332b] text-white text-sm font-semibold rounded-md hover:bg-[#2a241e] transition-colors flex justify-center items-center gap-2"
            >
              Ajouter au panier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL CATALOGUE ---
function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const user = useSelector((state) => state.user?.user);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo && products.length > 0) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [products, location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all");
        setProducts(res.data.products);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du catalogue :", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] text-[#3b332b]">
        <h2 className="text-xl font-semibold animate-pulse">Chargement de la collection...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-28 pb-12 px-5 font-sans text-[#3b332b]">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER DU CATALOGUE --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#3b332b] mb-2 text-center md:text-left">
              Notre Collection
            </h2>
            <p className="text-[#8c7e71] text-center md:text-left">
              Découvrez les dernières créations de nos stylistes.
            </p>
          </div>
          
          {/* Barre de recherche relookée avec les couleurs du thème */}
          <form className="flex items-center w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder="Rechercher une pièce..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 border-b border-[#3b332b] rounded-none shadow-none text-[#3b332b] py-2 w-full md:w-[220px] focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[#cba88c] placeholder:text-[#8c7e71] placeholder:italic text-sm transition-all"
            />
            <button 
              type="button" 
              className="bg-transparent border-none text-[#3b332b] uppercase text-xs font-bold tracking-wider ml-4 p-0 hover:text-[#cba88c] transition-colors whitespace-nowrap"
            >
              Chercher
            </button>
          </form>
        </div>
        
        {/* --- GRILLE DES PRODUITS --- */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#ece5dd] rounded-xl border-dashed shadow-sm">
            <h4 className="text-lg font-semibold mb-2 text-[#4a4036]">Aucune création trouvée.</h4>
            <p className="text-[#8c7e71]">Essayez d'autres mots-clés pour votre recherche "{searchTerm}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} user={user} />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}

export default Catalogue;