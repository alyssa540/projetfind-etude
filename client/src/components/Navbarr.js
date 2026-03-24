import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../JS/userSlice/userSlice";

function Navbarr() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  
  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login"); 
  };

  // Base style for standard links translated from your .nav-link CSS
  const navLinkStyle = "text-black uppercase text-[0.85rem] font-semibold tracking-[1.5px] mx-[15px] transition-all duration-300 hover:text-[#777] hover:-translate-y-[2px] block";

  return (
    <nav className=" bg-transparent w-full flex items-center justify-between p-[20px]">
      
      {/* BRAND (Title) */}
      <Link 
        to="/" 
        className="text-black font-serif text-[1.8rem] font-bold tracking-[1px] mr-[60px] whitespace-nowrap"
      >
        FashionHubStyle
      </Link>

      {/* Main Flex Container for Links, Search, and Profile */}
      <div className="flex flex-row items-center justify-end w-full">
        
        {/* Navigation Links */}
        <div className="flex flex-row items-center">
          <Link to="/" className={navLinkStyle}>Accueil</Link>
           <Link to="/catalogue" className={navLinkStyle}>Catalogue</Link>
          {/* SI NON CONNECTÉ */}
          {!user && (
            <>
              <Link to="/register" className={navLinkStyle}>S'inscrire</Link>
              <Link to="/login" className={navLinkStyle}>Se connecter</Link>
            </>
          )}

          {/* Liens spécifiques au CLIENT */}
          {user?.role === "client" && (
            <>
              <Link to="/panier" className={navLinkStyle}>Panier</Link>
              <Link to="/mes-commandes" className={navLinkStyle}>Mes commandes</Link>
            </>
          )}

          {/* Liens spécifiques au STYLISTE */}
          {user?.role === "styliste" && (
            <>
              <Link to="/mes-ventes" className={navLinkStyle}>Mes Ventes</Link>
              <Link to="/add-product" className={`${navLinkStyle} !text-[#2e8b57] font-bold`}>
                + Création
              </Link>
            </>
          )}

          {/* Liens spécifiques à l'ADMIN */}
          {user?.role === "admin" && (
            <Link to="/admin-dashboard" className={navLinkStyle}>Dashboard Admin</Link>
          )}
        </div>

        {/* Barre de recherche */}
        <form className="flex items-center mx-4">
          <input
            type="search"
            placeholder="Rechercher..."
            aria-label="Search"
            className="bg-transparent border-0 border-b border-black rounded-none shadow-none text-black py-[5px] w-[180px] focus:outline-none focus:ring-0 focus:border-b-2 focus:border-black placeholder:text-[#777] placeholder:italic placeholder:text-[0.9rem]"
          />
          <button 
            type="button" 
            className="bg-transparent border-none text-black uppercase text-[0.8rem] font-bold tracking-[1px] ml-[15px] p-0 hover:text-[#666] transition-colors"
          >
            Chercher
          </button>
        </form>

        {/* Profil et Déconnexion */}
        {user && (
          <div className="flex flex-row items-center space-x-4">
            <Link to="/profil" className={`${navLinkStyle} !mx-0 mr-4`}>Profil</Link>
            <button 
              onClick={handleLogout} 
              className="bg-black text-white border-none rounded-none uppercase text-[0.75rem] tracking-[1px] py-[8px] px-[15px] hover:bg-[#333] transition-colors"
            >
              Déconnexion
            </button>
          </div>
        )}
        
      </div>
    </nav>
  );
}

export default Navbarr;