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

  return (
    <div>
      <div className="wrapper">
        <form onSubmit={handleLogin} className="form-signin">
          <h2 className="form-signin-heading">Connectez-vous</h2>
          
          <input
            type="email" // Baddalnaha email bech navigateur y-verifi l'format
            className="form-control" // className fi 3oudh class
            name="email"
            placeholder="Email Address"
            required
            autoFocus
            onChange={(e) => setlogin({ ...login, email: e.target.value })}
          />
          
          <input
            type="password" // Baddalnaha password bech l'ketba tetkhabba
            className="form-control" // className fi 3oudh class
            name="password"
            placeholder="Password"
            required
            onChange={(e) => setlogin({ ...login, password: e.target.value })}
          />

          <button
            type="submit" // Zidna type submit bech y-déclenchi l'onSubmit mta3 l'form
            className="btn btn-lg btn-primary btn-block"
          >
            Se connecter
          </button>
          
          <h5 style={{ marginTop: "30px" }}>
            Tu n'as pas de compte ? <Link to="/register">S'inscrire maintenant</Link>
          </h5>
        </form>
      </div>
    </div>
  );
}

export default Login;