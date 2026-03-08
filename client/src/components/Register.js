import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { userRegister } from "../JS/userSlice/userSlice"; // Assure-toi du bon chemin
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [register, setregister] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "client", // <-- Par défaut, on inscrit un client
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div>
      <div className="wrapper">
        <form onSubmit={(e) => e.preventDefault()} className="form-signin">
          <h2 className="form-signin-heading">Please Register</h2>
          
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

          {/* AJOUT DU CHOIX DU RÔLE */}
          <select 
            className="form-control" 
            style={{ marginBottom: "15px", padding: "10px" }}
            onChange={(e) => setregister({ ...register, role: e.target.value })}
          >
            <option value="client">Je suis un Client</option>
            <option value="styliste">Je suis un Styliste Créateur</option>
          </select>

          <button
            className="btn btn-lg btn-primary btn-block"
            onClick={() => {
              dispatch(userRegister(register));
              setTimeout(() => {
                navigate("/profil");
              }, 1000);
            }}
          >
            Register
          </button>

          <h5 style={{ marginTop: "30px" }}>
            You already have an account? <Link to="/login">Sign in</Link>
          </h5>
        </form>
      </div>
    </div>
  );
}

export default Register;