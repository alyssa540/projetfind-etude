import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../JS/cartSlice/cartSlice";
import { useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// PRODUCT CARD  (inchangé — brutalist vibe)
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, user }) => {
  const dispatch = useDispatch();

  const [selectedSize, setSelectedSize] = useState(
    product.taillesDisponibles && product.taillesDisponibles.length > 0
      ? product.taillesDisponibles[0]
      : "Standard"
  );
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    dispatch(addToCart({ produit: product, taille: selectedSize, quantite: selectedQuantity }));
    alert(`Ajouté au panier ! (${selectedQuantity}x taille ${selectedSize})`);
    setSelectedQuantity(1);
  };

  return (
    <div
      id={product._id}
      className="group bg-white border-4 border-black flex flex-col relative transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-rotate-1"
    >
      {/* Sticker prix */}
      <div className="absolute top-4 -right-4 bg-[#e6ff00] border-2 border-black px-4 py-2 font-black text-lg z-10 transform rotate-6 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {product.prix} TND
      </div>

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden border-b-4 border-black bg-[#EAE8E3]">
        <img
          src={product.image || "https://via.placeholder.com/300"}
          alt={product.titre}
          className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
        />
      </div>

      {/* Infos */}
      <div className="p-5 flex flex-col flex-grow bg-[#FAF9F7]">
        <h3
          className="text-2xl font-black uppercase tracking-tighter text-black truncate mb-1"
          title={product.titre}
        >
          {product.titre}
        </h3>
        <p className="text-base font-serif italic text-gray-500 line-clamp-2 mb-6 flex-grow">
          {product.description}
        </p>

        {/* Contrôles client seulement */}
        {user?.role === "client" && (
          <div className="mt-auto space-y-4 pt-4 border-t-2 border-black border-dashed">
            <div className="flex items-center justify-between gap-3">
              {product.taillesDisponibles && product.taillesDisponibles.length > 0 ? (
                <div className="flex-1">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 text-sm font-bold uppercase tracking-widest bg-transparent border-2 border-black text-black rounded-none focus:outline-none focus:bg-[#e6ff00] cursor-pointer appearance-none text-center hover:bg-gray-100 transition-colors"
                  >
                    {product.taillesDisponibles.map((taille) => (
                      <option key={taille} value={taille}>{taille}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1 text-sm font-bold uppercase tracking-widest text-gray-400 text-center border-2 border-gray-300 p-2">
                  Taille unique
                </div>
              )}

              <div className="flex items-center border-2 border-black bg-white h-[40px]">
                <button
                  onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 h-full text-black font-black hover:bg-[#e6ff00] transition-colors border-r-2 border-black"
                >-</button>
                <span className="w-10 text-center text-sm font-black text-black">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity((prev) => prev + 1)}
                  className="px-3 h-full text-black font-black hover:bg-[#e6ff00] transition-colors border-l-2 border-black"
                >+</button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-black border-2 border-black hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200"
            >
              Ajouter au panier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// FILTER CONTENT
// Shared between the desktop dropdown panel and the mobile drawer.
// `onClose` is passed only when rendered inside the mobile drawer.
// ─────────────────────────────────────────────────────────────
const FilterContent = ({
  allCategories,
  allSizes,
  allColors,
  maxProductPrice,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  onClearAll,
  activeFilterCount,
  filteredCount,
  onClose,
}) => {
  const toggle = (setArr, val) =>
    setArr((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  return (
    <div>
      {/* Mobile-only header: title + close + clear */}
      {onClose && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-black">
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Filtres</span>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-[10px] font-black uppercase tracking-widest underline text-gray-500 hover:text-black transition-colors"
              >
                Effacer ({activeFilterCount})
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer les filtres"
              className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-lg hover:bg-[#e6ff00] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filter grid — 2 cols on small screens, 4 cols on desktop */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* ── CATÉGORIE ── */}
        {allCategories.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 pb-2 border-b-2 border-black">
              Catégorie
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allCategories.map((cat) => (
                <label
                  key={cat}
                  style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                >
                  <div
                    onClick={() => toggle(setSelectedCategories, cat)}
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid black",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      backgroundColor: selectedCategories.includes(cat) ? "#000" : "#fff",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {selectedCategories.includes(cat) && (
                      <span style={{ color: "#e6ff00", fontSize: "9px", fontWeight: 900, lineHeight: 1 }}>✓</span>
                    )}
                  </div>
                  <span
                    onClick={() => toggle(setSelectedCategories, cat)}
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                      color: selectedCategories.includes(cat) ? "#000" : "#888",
                    }}
                  >
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── TAILLE ── */}
        {allSizes.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 pb-2 border-b-2 border-black">
              Taille
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggle(setSelectedSizes, size)}
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    padding: "0 6px",
                    border: "2px solid black",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    backgroundColor: selectedSizes.includes(size) ? "#000" : "#fff",
                    color: selectedSizes.includes(size) ? "#fff" : "#000",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── COULEUR ── */}
        {allColors.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 pb-2 border-b-2 border-black">
              Couleur
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {allColors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggle(setSelectedColors, color)}
                  style={{
                    padding: "4px 10px",
                    border: "2px solid black",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    backgroundColor: selectedColors.includes(color) ? "#000" : "#fff",
                    color: selectedColors.includes(color) ? "#e6ff00" : "#000",
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PRIX ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 pb-2 border-b-2 border-black">
            Prix (TND)
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number"
              min="0"
              value={priceMin}
              onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))}
              placeholder="Min"
              className="[appearance:textfield]"
              style={{
                width: "100%",
                border: "2px solid black",
                padding: "6px",
                fontSize: "11px",
                fontWeight: 900,
                textAlign: "center",
                background: "#fff",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.background = "#e6ff00")}
              onBlur={(e) => (e.target.style.background = "#fff")}
            />
            <span style={{ color: "#aaa", fontWeight: 900, flexShrink: 0 }}>—</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(Math.max(priceMin, Number(e.target.value)))}
              placeholder="Max"
              className="[appearance:textfield]"
              style={{
                width: "100%",
                border: "2px solid black",
                padding: "6px",
                fontSize: "11px",
                fontWeight: 900,
                textAlign: "center",
                background: "#fff",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.background = "#e6ff00")}
              onBlur={(e) => (e.target.style.background = "#fff")}
            />
          </div>
          {maxProductPrice > 0 && (
            <p style={{ fontSize: "10px", color: "#aaa", textAlign: "center", marginTop: "6px" }}>
              Max disponible : {maxProductPrice} TND
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL — CATALOGUE
// ─────────────────────────────────────────────────────────────
function Catalogue() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Responsive: true when viewport < 768 px (md breakpoint)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes,       setSelectedSizes]       = useState([]);
  const [selectedColors,      setSelectedColors]      = useState([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);

  const user     = useSelector((state) => state.user?.user);
  const location = useLocation();

  // Track viewport width for mobile/desktop filter layout
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll to a specific product when navigated from Home
  useEffect(() => {
    if (location.state?.scrollTo && products.length > 0) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [products, location.state]);

  // Fetch catalogue
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/all");
        const fetched = res.data.products;
        setProducts(fetched);
        if (fetched.length > 0) {
          const max = Math.max(...fetched.map((p) => p.prix));
          setPriceMax(max);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur récupération catalogue :", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Derive unique filter options from loaded products ──

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.categorie).filter(Boolean))].sort(),
    [products]
  );

  const allSizes = useMemo(() => {
    const ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
    const sizes = [...new Set(products.flatMap((p) => p.taillesDisponibles || []))];
    return sizes.sort((a, b) => {
      const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      return ai === -1 ? 1 : bi === -1 ? -1 : ai - bi;
    });
  }, [products]);

  const allColors = useMemo(
    () => [...new Set(products.flatMap((p) => p.couleurs || []).filter(Boolean))].sort(),
    [products]
  );

  const maxProductPrice = useMemo(
    () => (products.length > 0 ? Math.max(...products.map((p) => p.prix)) : 0),
    [products]
  );

  // Number of active filters (drives the badge on the button)
  const activeFilterCount = useMemo(
    () =>
      selectedCategories.length +
      selectedSizes.length +
      selectedColors.length +
      (priceMin > 0 || (priceMax > 0 && priceMax < maxProductPrice) ? 1 : 0),
    [selectedCategories, selectedSizes, selectedColors, priceMin, priceMax, maxProductPrice]
  );

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceMin(0);
    setPriceMax(maxProductPrice);
    setSearchTerm("");
  };

  // ── Apply all active filters + search ──
  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (searchTerm && !p.titre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCategories.length && !selectedCategories.includes(p.categorie)) return false;
        if (selectedSizes.length && !selectedSizes.some((s) => p.taillesDisponibles?.includes(s))) return false;
        if (selectedColors.length && !selectedColors.some((c) => p.couleurs?.includes(c))) return false;
        if (priceMax > 0 && (p.prix < priceMin || p.prix > priceMax)) return false;
        return true;
      }),
    [products, searchTerm, selectedCategories, selectedSizes, selectedColors, priceMin, priceMax]
  );

  // Props shared between desktop panel and mobile drawer
  const filterProps = {
    allCategories, allSizes, allColors, maxProductPrice,
    priceMin, priceMax, setPriceMin, setPriceMax,
    selectedCategories, setSelectedCategories,
    selectedSizes,       setSelectedSizes,
    selectedColors,      setSelectedColors,
    onClearAll: handleClearAll,
    activeFilterCount,
    filteredCount: filteredProducts.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-black">
        <h2 className="text-4xl font-black uppercase tracking-tighter animate-pulse">Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-6 font-sans text-black">
      <div className="max-w-[1400px] mx-auto">

        {/* ═══════════════════════════════════════════════════════
            HEADER — Titre + barre de recherche + bouton FILTRES
        ═══════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10 gap-6 md:gap-8">

          {/* Titre */}
          <div className="flex-shrink-0">
            <h2 className="text-[4rem] md:text-[6rem] font-black leading-[0.85] tracking-tighter uppercase mb-2">
              Notre<br />
              <span className="font-serif italic text-gray-500 font-light lowercase">Catalogue</span>
            </h2>
          </div>

          {/* Barre de recherche (inchangée) + Bouton Filtres */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "12px",
              width: "100%",
              maxWidth: "640px",
            }}
          >
            {/* Search bar — exactly as original */}
            <form
              className="flex items-end flex-1 border-b-4 border-black pb-2 group"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="search"
                placeholder="Rechercher une pièce..."
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-2xl md:text-3xl font-black uppercase tracking-widest text-black py-2 w-full focus:outline-none placeholder:text-gray-300 placeholder:italic transition-all"
              />
              <button
                type="button"
                className="bg-transparent border-none text-black uppercase text-sm font-black tracking-widest ml-4 p-2 hover:bg-[#e6ff00] transition-colors whitespace-nowrap"
              >
                Go
              </button>
            </form>

            {/* ── FILTER BUTTON ── */}
            <button
              onClick={() => setIsFilterOpen((o) => !o)}
              aria-expanded={isFilterOpen}
              aria-label="Ouvrir / fermer les filtres"
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "2px solid black",
                padding: "10px 16px",
                fontWeight: 900,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.18s",
                backgroundColor: isFilterOpen || activeFilterCount > 0 ? "#000" : "#fff",
                color: isFilterOpen || activeFilterCount > 0 ? "#e6ff00" : "#000",
                boxShadow:
                  isFilterOpen || activeFilterCount > 0
                    ? "3px 3px 0px 0px rgba(0,0,0,0.35)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                if (!isFilterOpen && activeFilterCount === 0) {
                  e.currentTarget.style.backgroundColor = "#e6ff00";
                  e.currentTarget.style.boxShadow = "3px 3px 0px 0px rgba(0,0,0,1)";
                  e.currentTarget.style.transform = "translate(-2px,-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isFilterOpen && activeFilterCount === 0) {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              {/* Funnel icon */}
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                <line x1="0.5"  y1="1"   x2="12.5" y2="1"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2.5"  y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5"    y1="10"  x2="8"    y2="10"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              Filtres

              {/* Active-filter badge */}
              {activeFilterCount > 0 && (
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e6ff00",
                    color: "#000",
                    fontSize: "10px",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            DESKTOP FILTER PANEL  (drops down below the header)
            Shown when isFilterOpen=true AND screen >= 768 px
        ═══════════════════════════════════════════════════════ */}
        {isFilterOpen && !isMobile && (
          <div
            className="filter-panel-enter"
            style={{
              borderTop: "4px solid black",
              borderBottom: "4px solid black",
              padding: "28px 8px",
              marginBottom: "32px",
              backgroundColor: "#fff",
            }}
          >
            <FilterContent {...filterProps} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            RESULTS BAR — product count + clear button
        ═══════════════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            paddingBottom: "12px",
            borderBottom: "2px dashed #ccc",
          }}
        >
          <span className="text-xs font-black uppercase tracking-widest text-gray-600">
            {filteredProducts.length} article{filteredProducts.length !== 1 ? "s" : ""}
          </span>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                fontSize: "11px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#888",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
            >
              Effacer les filtres ({activeFilterCount})
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            PRODUCT GRID
        ═══════════════════════════════════════════════════════ */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-32 border-4 border-black border-dashed">
            <h4 className="text-3xl font-black uppercase tracking-widest mb-4 text-black">
              Aucune création trouvée
            </h4>
            <p className="text-xl font-serif italic text-gray-500 mb-6">
              {searchTerm
                ? `Aucun résultat pour "${searchTerm}".`
                : "Essayez d'autres filtres."}
            </p>
            <button
              onClick={handleClearAll}
              className="border-2 border-black px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#e6ff00] transition-colors"
            >
              Effacer tous les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE FILTER DRAWER
          Shown when isFilterOpen=true AND screen < 768 px
      ═══════════════════════════════════════════════════════ */}
      {isFilterOpen && isMobile && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer slides up from bottom */}
          <div
            className="filter-drawer"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#FAF9F7",
              borderTop: "4px solid black",
              zIndex: 50,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Scrollable filter content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <FilterContent
                {...filterProps}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>

            {/* Sticky "Voir X résultats" button */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "2px solid black",
                backgroundColor: "#FAF9F7",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setIsFilterOpen(false)}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  border: "2px solid black",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e6ff00";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#000";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                Voir {filteredProducts.length} résultat
                {filteredProducts.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Catalogue;
