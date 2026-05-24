import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../JS/userSlice/userSlice";

function Navbarr() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user     = useSelector((state) => state.user?.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // true when viewport < 1024 px (lg breakpoint)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024
  );

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false); // close drawer when resizing to desktop
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMenuOpen(false);
  };

  // ── Styles (identical to the original) ──
  const navLinkStyle =
    "text-black uppercase text-xs font-black tracking-widest px-3 py-2 border-2 border-transparent hover:border-black hover:bg-[#e6ff00] hover:-translate-y-1 hover:rotate-[-2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 inline-block bg-transparent";

  const btnStyle =
    "bg-black text-white border-2 border-black uppercase text-xs font-black tracking-widest py-2 px-4 hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer";

  // ── Mobile-only link style ──
  const mobileLinkStyle =
    "block w-full text-left text-black uppercase text-sm font-black tracking-widest py-4 px-6 border-b-2 border-black hover:bg-[#e6ff00] transition-colors no-underline";

  // ════════════════════════════════════════════════
  // DESKTOP — exact original navbar, no changes
  // ════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <nav className="bg-[#FAF9F7] w-full flex items-end justify-between px-6 py-4 border-b-4 border-black sticky top-0 z-50">

        <Link
          to="/"
          className="text-[3rem] md:text-[4rem] font-black tracking-tighter uppercase leading-none mr-12 hover:italic transition-all text-black no-underline"
        >
          STYLIQUE
          <span className="text-[#e6ff00]" style={{ WebkitTextStroke: "2px black" }}>*</span>
        </Link>

        <div className="flex flex-row items-center justify-end flex-grow pb-1">
          <div className="flex flex-row items-center gap-2 flex-wrap">
            <Link to="/"         className={navLinkStyle}>Accueil</Link>
            <Link to="/catalogue" className={navLinkStyle}>Catalogue</Link>

            {!user && (
              <>
                <Link to="/register" className={navLinkStyle}>S'inscrire</Link>
                <Link to="/login"    className={navLinkStyle}>Se connecter</Link>
              </>
            )}

            {user?.role === "client" && (
              <>
                <Link to="/panier"        className={navLinkStyle}>Panier</Link>
                <Link to="/mes-commandes" className={navLinkStyle}>Mes commandes</Link>
              </>
            )}

            {user?.role === "styliste" && (
              <>
                <Link to="/mes-ventes" className={navLinkStyle}>Mes Ventes</Link>
                <Link to="/archives"   className={navLinkStyle}>Mes Archives</Link>
                <Link
                  to="/add-product"
                  className="bg-[#e6ff00] text-black uppercase text-xs font-black tracking-widest px-3 py-2 border-2 border-black hover:bg-black hover:text-[#e6ff00] hover:rotate-[2deg] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 inline-block ml-2"
                >
                  + Création
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                className={`${navLinkStyle} bg-black text-white hover:text-black`}
              >
                Dashboard Admin
              </Link>
            )}
          </div>

          {user && (
            <div className="flex flex-row items-center gap-3 ml-8 pl-8 border-l-2 border-black h-full">
              <Link
                to="/profil"
                className="font-serif italic text-lg text-black hover:text-gray-500 mr-2 no-underline"
              >
                {user.name || "Profil"}
              </Link>
              <button onClick={() => navigate("/edit-profile")} className={btnStyle}>
                Mettre à jour
              </button>
              <button
                onClick={handleLogout}
                className={`${btnStyle} !bg-white !text-black hover:!bg-black hover:!text-white`}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // ════════════════════════════════════════════════
  // MOBILE — hamburger + collapsible drawer
  // ════════════════════════════════════════════════
  return (
    <div className="sticky top-0 z-50">

      {/* Top bar */}
      <nav className="bg-[#FAF9F7] w-full flex items-center justify-between px-6 py-4 border-b-4 border-black">
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="text-[2.2rem] font-black tracking-tighter uppercase leading-none hover:italic transition-all text-black no-underline"
        >
          STYLIQUE
          <span className="text-[#e6ff00]" style={{ WebkitTextStroke: "2px black" }}>*</span>
        </Link>

        {/* Hamburger / close button */}
        <button
          onClick={() => setIsMenuOpen((o) => !o)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          className="w-12 h-12 border-2 border-black flex flex-col justify-center items-center hover:bg-[#e6ff00] transition-colors flex-shrink-0"
        >
          {isMenuOpen ? (
            <span className="font-black text-xl leading-none select-none">✕</span>
          ) : (
            <span className="flex flex-col gap-[5px]">
              <span className="block w-6 h-[2px] bg-black" />
              <span className="block w-6 h-[2px] bg-black" />
              <span className="block w-6 h-[2px] bg-black" />
            </span>
          )}
        </button>
      </nav>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="bg-[#FAF9F7] border-b-4 border-black nav-mobile-enter">

          <Link to="/"          onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Accueil</Link>
          <Link to="/catalogue" onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Catalogue</Link>

          {!user && (
            <>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>S'inscrire</Link>
              <Link to="/login"    onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Se connecter</Link>
            </>
          )}

          {user?.role === "client" && (
            <>
              <Link to="/panier"        onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Panier</Link>
              <Link to="/mes-commandes" onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Mes commandes</Link>
            </>
          )}

          {user?.role === "styliste" && (
            <>
              <Link to="/mes-ventes" onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Mes Ventes</Link>
              <Link to="/archives"   onClick={() => setIsMenuOpen(false)} className={mobileLinkStyle}>Mes Archives</Link>
              <Link
                to="/add-product"
                onClick={() => setIsMenuOpen(false)}
                className={`${mobileLinkStyle} bg-[#e6ff00]`}
              >
                + Création
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin-dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`${mobileLinkStyle} bg-black text-white hover:bg-black hover:text-[#e6ff00]`}
            >
              Dashboard Admin
            </Link>
          )}

          {/* Logged-in user section */}
          {user && (
            <div className="px-6 py-5 bg-[#EAE8E3] border-t-4 border-black">
              <Link
                to="/profil"
                onClick={() => setIsMenuOpen(false)}
                className="font-serif italic text-xl text-black block mb-4 no-underline hover:text-gray-500 transition-colors"
              >
                {user.name || "Profil"}
              </Link>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigate("/edit-profile"); setIsMenuOpen(false); }}
                  className={`${btnStyle} flex-1`}
                >
                  Mettre à jour
                </button>
                <button
                  onClick={handleLogout}
                  className={`${btnStyle} flex-1 !bg-white !text-black hover:!bg-black hover:!text-white`}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbarr;
