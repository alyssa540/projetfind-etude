import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { userRegister } from "../JS/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [register, setregister] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "client", // Default role
    taille: "",
    adress: "",
    phone: "",
    logo: null,     // Raddineha null bech ta9bel fichier (taswira)
    nom_marque: "",
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = (e) => {
    e.preventDefault();

    // Na7ina l'conditions lkol! (7ata chay mouch obligatoire tawa)

    // L'envoie lel Redux
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
          
          {/* ROLE SELECTION BUTTONS */}
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

          {/* COMMON FIELDS */}
          <input
            type="text"
            className="form-control"
            name="name"
            placeholder="Name"
            onChange={(e) => setregister({ ...register, name: e.target.value })}
          />
          <input
            type="text"
            className="form-control"
            name="LastName"
            placeholder="Last Name"
            onChange={(e) => setregister({ ...register, lastname: e.target.value })}
          />
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email Address"
            onChange={(e) => setregister({ ...register, email: e.target.value })}
          />
          <input
            type="password"
            className="form-control"
            name="Password"
            placeholder="Password"
            onChange={(e) => setregister({ ...register, password: e.target.value })}
          />

          {/* CONDITIONAL FIELDS (Only for Clients) */}
          {register.role === "client" && (
            <div style={{ marginTop: "15px", marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
              <h5 style={{ fontSize: "14px", color: "gray", marginBottom:"10px" }}>Informations Client</h5>
              <input
                type="text"
                className="form-control"
                name="taille"
                placeholder="Taille"
                onChange={(e) => setregister({ ...register, taille: e.target.value })}
              />
              <input
                type="text"
                className="form-control"
                name="adress"
                placeholder="Adresse"
                onChange={(e) => setregister({ ...register, adress: e.target.value })}
              />
              <input
                type="text"
                className="form-control"
                name="phone"
                placeholder="Téléphone"
                onChange={(e) => setregister({ ...register, phone: e.target.value })}
              />
            </div>
          )}

          {/* CONDITIONAL FIELDS (Only for Stylistes) */}
          {register.role === "styliste" && (
            <div style={{ marginTop: "15px", marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
              <h5 style={{ fontSize: "14px", color: "gray", marginBottom:"10px" }}>Informations Styliste</h5>
              <input
                type="text"
                className="form-control"
                name="nom_marque"
                placeholder="Nom de votre Marque"
                onChange={(e) => setregister({ ...register, nom_marque: e.target.value })}
              />
              <input
                type="text"
                className="form-control"
                name="adress"
                placeholder="Adresse de l'atelier/boutique"
                onChange={(e) => setregister({ ...register, adress: e.target.value })}
              />
              
              {/* L'Input JDID mtaa l'Upload Taswira */}
              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "13px", color: "gray" }}>Upload Logo :</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  name="logo"
                  onChange={(e) => setregister({ ...register, logo: e.target.files[0] })}
                />
              </div>
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