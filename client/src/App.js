import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css"; // On peut créer ce fichier pour des styles globaux

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



function App() {
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

          
        
        </Routes>
      </div>
    </div>
  );
}

export default App;