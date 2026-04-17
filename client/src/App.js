import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
// Make sure this path points to where your userSlice is located!
import { userCurrent } from "./JS/userSlice/userSlice"; 
import "./App.css"; 

// Importation des composants
import Navbar from "./components/Navbarr";
import Login from "./components/Login";
import Register from "./components/Register";
import Profil from "./components/Profil";
import AddProduct from "./components/AddProduct";
import Catalogue from "./components/Catalogue";
import Home from "./components/Home";
import Panier from "./components/Panier";
import StylistOrders from "./components/StylistOrder";
import MesCommandes from "./components/MesCommandes";
import Archives from "./components/Archives";
import EditProfil from "./components/EditProfil"; 
import PreferenceForm from "./components/PreferenceForm";

function App() {
  const dispatch = useDispatch();
 

  useEffect(() => {
    // Check if a token exists in localStorage when the app loads
    const token = localStorage.getItem("token");
    
    // If a token exists, fetch the user data to rehydrate the Redux store
    if (token) {
      dispatch(userCurrent());
    }
  }, [dispatch]);

  return (
    <div className="App" >
      {/* La Navbar reste visible sur toutes les pages */}
      <Navbar /> 
      
      {/* Conteneur principal pour le contenu des pages */}
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Définition des différentes routes (chemins) */}
          <Route path="/" element={<Home/>} /> {/* Par défaut, la page d'accueil affiche le catalogue */}
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/stylist-orders" element={<StylistOrders />} />
          <Route path="/mes-ventes" element={<StylistOrders />} />
          <Route path="/mes-commandes" element={<MesCommandes />} />
          <Route path="/edit-profile" element={<EditProfil />} />
          <Route path="/archives" element={<Archives />} /> 
          <Route path="/preference-form" element={<PreferenceForm />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;