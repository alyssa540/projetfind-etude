import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function AdminDashboard() {
  const currentUser = useSelector((state) => state.user?.user);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalStylistes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const users = res.data.users;
        setStats({
          totalUsers: users.length,
          totalClients: users.filter(u => u.role === "client").length,
          totalStylistes: users.filter(u => u.role === "styliste").length,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
      }
    };

    if (currentUser?.role === "admin") {
      fetchStats();
    }
  }, [currentUser]);

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F7] text-black px-6">
        <div className="bg-red-500 border-4 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">Accès refusé</h2>
          <p className="font-bold text-lg uppercase tracking-widest text-black">Espace réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F7] pt-24 font-sans text-black relative">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r-4 border-black px-8 py-12 flex-col hidden md:flex min-h-[calc(100vh-6rem)] shrink-0 z-10 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black text-black mb-12 uppercase tracking-tighter">Espace Admin</h2>
        <nav className="flex flex-col space-y-6">
          <Link 
            to="/admin/dashboard" 
            className="px-6 py-4 bg-black text-white border-4 border-black font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_rgba(230,255,0,1)] rounded-none flex items-center gap-3"
          >
            <span className="text-xl">📊</span> Vue d'ensemble
          </Link>
          <Link 
            to="/admin/users" 
            className="px-6 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none flex items-center gap-3"
          >
            <span className="text-xl">👥</span> Utilisateurs
          </Link>
          <Link 
            to="/admin/orders" 
            className="px-6 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none flex items-center gap-3"
          >
            <span className="text-xl">📦</span> Commandes
          </Link>
          <Link 
            to="/admin/products" 
            className="px-6 py-4 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e6ff00] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none flex items-center gap-3"
          >
            <span className="text-xl">👗</span> Produits
          </Link>
        </nav>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-8 md:p-16 lg:p-24 overflow-x-hidden">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 uppercase tracking-tighter text-black">
          Bienvenue, Admin ! 
        </h1>
        <p className="font-bold text-gray-700 mb-16 uppercase tracking-widest text-sm md:text-base border-l-8 border-[#e6ff00] pl-6 py-2">
          Voici un résumé de l'activité sur votre plateforme.
        </p>

        {/* CARTES DE STATISTIQUES */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none flex items-center space-x-6 group">
            <div className="w-20 h-20 bg-[#e6ff00] border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              👥
            </div>
            <div>
              <p className="text-black text-sm font-black uppercase tracking-widest mb-2">Total Clients</p>
              <h3 className="text-5xl font-black text-black">{stats.totalClients}</h3>
            </div>
          </div>

          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none flex items-center space-x-6 group">
            <div className="w-20 h-20 bg-[#ff00ff] border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              🎨
            </div>
            <div>
              <p className="text-black text-sm font-black uppercase tracking-widest mb-2">Total Designeurs</p>
              <h3 className="text-5xl font-black text-black">{stats.totalStylistes}</h3>
            </div>
          </div>

          <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none flex items-center space-x-6 group">
            <div className="w-20 h-20 bg-black text-white border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(230,255,0,1)] group-hover:scale-110 transition-transform">
              📈
            </div>
            <div>
              <p className="text-black text-sm font-black uppercase tracking-widest mb-2">Total Inscrits</p>
              <h3 className="text-5xl font-black text-black">{stats.totalUsers}</h3>
            </div>
          </div>

        </div>

        {/* RACCOURCIS */}
        <div className=" border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 rounded-none">
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-8 text-black">
            Raccourcis rapides
          </h3>
          <div className="flex flex-wrap gap-6">
            <Link 
              to="/admin/users" 
              className="px-8 py-5 bg-white text-black border-4 border-black font-black uppercase tracking-widest text-sm md:text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none flex items-center gap-4"
            >
              Gérer les utilisateurs
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;