import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tous"); // "tous", "client", "styliste"

  const currentUser = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, estBloque: !currentStatus } : user
        )
      );
      
    } catch (error) {
      console.error(error);
      alert("Erreur lors du changement de statut.");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === "tous") return true;
    return user.role === activeTab;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] text-black">
        <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse flex justify-center">
          <h2 className="text-2xl font-black uppercase tracking-widest">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] pt-32 pb-24 px-4 sm:px-8 lg:px-16 font-sans text-black relative">
      <div className="w-full max-w-[98vw] mx-auto">
        <h2 className="text-center text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4 text-black">
          Tableau de bord
        </h2>
        <p className="text-center font-bold text-gray-600 mb-12 uppercase tracking-widest text-sm md:text-base">
          Consultez et gérez les comptes des clients et des designeurs.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("tous")}
            className={`px-8 py-4 font-black uppercase tracking-widest text-sm md:text-base border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none ${
              activeTab === "tous" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveTab("client")}
            className={`px-8 py-4 font-black uppercase tracking-widest text-sm md:text-base border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none ${
              activeTab === "client" ? "bg-[#e6ff00] text-black" : "bg-white text-black"
            }`}
          >
            Liste Clients
          </button>
          <button
            onClick={() => setActiveTab("styliste")} 
            className={`px-8 py-4 font-black uppercase tracking-widest text-sm md:text-base border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none ${
              activeTab === "styliste" ? "bg-[#e6ff00] text-black" : "bg-white text-black"
            }`}
          >
            Liste Designeurs
          </button>
        </div>

        <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-none w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
            <thead>
              <tr className="bg-[#e6ff00] border-b-4 border-black">
                <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black w-1/4">Nom & Prénom</th>
                <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black w-1/4">Email</th>
                <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black text-center">Rôle</th>
                <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base border-r-4 border-black text-center">Statut</th>
                <th className="p-6 font-black uppercase tracking-widest text-sm md:text-base text-center w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6 font-black text-xl md:text-2xl uppercase tracking-wider border-r-4 border-black break-words">
                    {user.name} {user.lastName || user.lastname}
                  </td>
                  
                  <td className="p-6 text-lg font-bold text-gray-700 border-r-4 border-black break-all">
                    {user.email}
                  </td>
                  
                  <td className="p-6 text-center border-r-4 border-black">
                    <span className="inline-block bg-black text-white px-4 py-2 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(230,255,0,1)]">
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="p-6 text-center border-r-4 border-black">
                    {user.estBloque ? (
                      <span className="inline-block bg-red-500 text-white border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Bloqué
                      </span>
                    ) : (
                      <span className="inline-block bg-white text-black border-2 border-black px-4 py-2 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Actif
                      </span>
                    )}
                  </td>
                  
                  <td className="p-6 align-middle">
                    <div className="flex flex-col xl:flex-row gap-4 justify-center items-center w-full">
                      
                      {user.role === 'styliste' && (
                        <button
                          onClick={() => navigate(`/admin/designers/${user._id}/creations`)}
                          className="w-full xl:w-auto px-5 py-4 bg-[#e6ff00] text-black border-4 border-black font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none text-center"
                        >
                          Créations
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleBlock(user._id, user.estBloque)}
                        className={`w-full xl:w-auto px-5 py-4 font-black uppercase tracking-widest text-xs border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all rounded-none text-center ${
                          user.estBloque
                            ? "bg-black text-white hover:bg-[#e6ff00] hover:text-black"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        {user.estBloque ? "Débloquer" : "Bloquer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-16 text-center bg-white">
                    <h3 className="text-2xl font-black uppercase tracking-widest text-black">Aucun utilisateur trouvé.</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;