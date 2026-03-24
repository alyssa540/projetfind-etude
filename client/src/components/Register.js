import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { userRegister } from "../JS/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  // 1. Update state to include all possible fields
  const [register, setregister] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "client", // Default role
    taille: "",
    adress: "",
    phone: "",
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 4. Handle form submission and validation
  const handleRegister = (e) => {
    e.preventDefault();

    // Base validation for both roles
    if (!register.name || !register.lastname || !register.email || !register.password) {
      alert("Veuillez remplir le nom, prénom, email et mot de passe.");
      return;
    }

    // Specific validation for 'client'
    if (register.role === "client") {
      if (!register.taille || !register.adress || !register.phone) {
        alert("En tant que client, veuillez renseigner votre taille, adresse et numéro de téléphone.");
        return;
      }
    }

    // If validation passes, dispatch and navigate
    dispatch(userRegister(register));
    setTimeout(() => {
      navigate("/profil");
    }, 1000);
  };

  return (
    <div>
      <div className="wrapper">
        <form onSubmit={handleRegister} className="form-signin">
          <h2 className="form-signin-heading">Inscription</h2>
          
          {/* 2. ROLE SELECTION BUTTONS */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              type="button"
              className={`btn ${register.role === "client" ? "btn-primary" : "btn-outline-primary"}`}
              style={{ flex: 1 }}
              onClick={() => setregister({ ...register, role: "client" })}
            >
              Je suis Client
            </button>
            <button
              type="button"
              className={`btn ${register.role === "styliste" ? "btn-primary" : "btn-outline-primary"}`}
              style={{ flex: 1 }}
              onClick={() => setregister({ ...register, role: "styliste" })}
            >
              Je suis Styliste
            </button>
          </div>

          {/* COMMON FIELDS (Required for everyone) */}
          <input
            type="text"
            className="form-control"
            name="name"
            placeholder="Name *"
            onChange={(e) => setregister({ ...register, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            name="LastName"
            placeholder="Last Name *"
            onChange={(e) => setregister({ ...register, lastname: e.target.value })}
          />
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email Address *"
            onChange={(e) => setregister({ ...register, email: e.target.value })}
          />
          <input
            type="password"
            className="form-control"
            name="Password"
            placeholder="Password *"
            onChange={(e) => setregister({ ...register, password: e.target.value })}
          />

          {/* 3. CONDITIONAL FIELDS (Only for Clients) */}
          {register.role === "client" && (
            <div style={{ marginTop: "15px", marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
              <h5 style={{ fontSize: "14px", color: "gray", marginBottom:"10px" }}>Informations Client (Obligatoires)</h5>
              <input
                type="text"
                className="form-control"
                name="taille"
                placeholder="Taille *"
                onChange={(e) => setregister({ ...register, taille: e.target.value })}
              />
              <input
                type="text"
                className="form-control"
                name="adress"
                placeholder="Adresse *"
                onChange={(e) => setregister({ ...register, adress: e.target.value })}
              />
              <input
                type="text"
                className="form-control"
                name="phone"
                placeholder="Téléphone *"
                onChange={(e) => setregister({ ...register, phone: e.target.value })}
              />
            </div>
          )}

          <button type="submit" className="btn btn-lg btn-primary btn-block" style={{ marginTop: "15px" }}>
            S'inscrire
          </button>

          <h5 style={{ marginTop: "30px" }}>
            Tu as déja un compte? <Link to="/login">Connecte-toi</Link>
          </h5>
        </form>
      </div>
    </div>
  );
}

export default Register;