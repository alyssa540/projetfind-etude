import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { userlogin } from "../JS/userSlice/userSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, setlogin] = useState({
    email: "",
    password: "",
  });

  // Fonction bech n-gériw biha e-submit mta3 l'formulaire
  const handleLogin = (e) => {
    e.preventDefault(); // tna7i l'rechargement mta3 l'page
    
    // Naba3thou l'action lel Redux
    dispatch(userlogin(login));
    
    // N-naviguiw lel profil
    navigate("/profil"); 
  };

  // Reusable input style for the brutalist theme (same as Register)
  const inputStyle = "w-full p-4 mb-6 bg-white border-2 border-black text-black font-bold uppercase tracking-widest text-sm focus:outline-none focus:bg-[#e6ff00] transition-colors placeholder:text-gray-400 rounded-none";

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <form onSubmit={handleLogin} className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center text-black">
            Connexion
          </h2>
          
          <input
            type="email" // Baddalnaha email bech navigateur y-verifi l'format
            className={inputStyle} 
            name="email"
            placeholder="Adresse Email"
            required
            autoFocus
            onChange={(e) => setlogin({ ...login, email: e.target.value })}
          />
          
          <input
            type="password" // Baddalnaha password bech l'ketba tetkhabba
            className={inputStyle} 
            name="password"
            placeholder="Mot de passe"
            required
            onChange={(e) => setlogin({ ...login, password: e.target.value })}
          />

          <button
            type="submit" // Zidna type submit bech y-déclenchi l'onSubmit mta3 l'form
            className="w-full py-4 mt-2 bg-black text-white text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            Se connecter
          </button>
          
          <p className="mt-8 text-center text-sm font-bold uppercase tracking-widest">
            Tu n'as pas de compte ? <br className="md:hidden" />
            <Link 
              to="/register" 
              className="text-black underline decoration-2 decoration-[#e6ff00] hover:bg-[#e6ff00] transition-colors p-1 mt-2 inline-block"
            >
              S'inscrire maintenant
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;