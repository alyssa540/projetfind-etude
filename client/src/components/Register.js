import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { userRegister } from "../JS/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const STYLES = ["casual", "chic", "streetwear", "élégant", "sport"];
const OCCASIONS = ["tous les jours", "soirée", "travail", "sortie"];
const TAILLES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function Register() {
  const [register, setregister] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "client",
    taille: "M", // Initialisé sur M par défaut pour la sélection visuelle
    adress: "",
    phone: "",
    logo: null,
    nom_marque: "",
    style: "casual",
    couleurs: "",
    occasion: "tous les jours",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await dispatch(userRegister(register));

    if (register.role !== "client" || !result.payload?.token) {
      navigate("/profil");
      return;
    }

    try {
      const token = result.payload.token;
      const rec = await axios.get("http://localhost:5000/api/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/preference", { state: { aiProducts: rec.data.products } });
    } catch {
      navigate("/profil");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full p-3 mb-4 bg-white border-2 border-black text-black font-bold uppercase tracking-widest text-sm focus:outline-none focus:bg-[#e6ff00] transition-colors placeholder:text-gray-400 rounded-none";

  const chipBtn = (active) =>
    `px-3 py-2 border-2 border-black text-xs font-black uppercase tracking-wide transition-all ${
      active
        ? "bg-[#e6ff00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
        : "bg-white hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        <form onSubmit={handleRegister} className="flex flex-col">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-center text-black">
            Inscription
          </h2>

          {/* ROLE SELECTION */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              type="button"
              className={`flex-1 py-3 px-4 border-2 border-black font-black uppercase text-xs tracking-widest transition-all duration-200 ${
                register.role === "client"
                  ? "bg-[#e6ff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
              onClick={() => setregister({ ...register, role: "client" })}
            >
              Je suis Client
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 border-2 border-black font-black uppercase text-xs tracking-widest transition-all duration-200 ${
                register.role === "styliste"
                  ? "bg-[#e6ff00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
              onClick={() => setregister({ ...register, role: "styliste" })}
            >
              Je suis Styliste
            </button>
          </div>

          {/* COMMON FIELDS */}
          <input
            type="text"
            className={inputStyle}
            name="name"
            placeholder="Nom"
            autoComplete="family-name"
            onChange={(e) => setregister({ ...register, name: e.target.value })}
          />
          <input
            type="text"
            className={inputStyle}
            name="LastName"
            placeholder="Prénom"
            autoComplete="given-name"
            onChange={(e) => setregister({ ...register, lastname: e.target.value })}
          />
          <input
            type="email"
            className={inputStyle}
            name="email"
            placeholder="Adresse Email"
            autoComplete="email"
            onChange={(e) => setregister({ ...register, email: e.target.value })}
          />
          <input
            type="password"
            className={inputStyle}
            name="Password"
            placeholder="Mot de passe"
            autoComplete="current-password"
            onChange={(e) => setregister({ ...register, password: e.target.value })}
          />

          {/* CLIENT FIELDS */}
          {register.role === "client" && (
            <div className="mt-2 mb-6 p-5 border-2 border-black border-dashed bg-[#FAF9F7]">
              <h5 className="font-serif italic text-lg text-black mb-4">Informations Client</h5>
              
              {/* SÉLECTEUR DE TAILLE REFAIT */}
              <div className="mb-5">
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                  Sélectionnez votre taille
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAILLES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={chipBtn(register.taille === t)}
                      onClick={() => setregister({ ...register, taille: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                className={inputStyle}
                name="adress"
                placeholder="Adresse de livraison"
            
                onChange={(e) => setregister({ ...register, adress: e.target.value })}
              />
              <input
                type="text"
                className={`${inputStyle} mb-6`}
                name="phone"
                placeholder="Téléphone"
                onChange={(e) => setregister({ ...register, phone: e.target.value })}
              />

              {/* PREFERENCE SECTION */}
              <div className="pt-4 border-t-2 border-dashed border-black">
                <h5 className="font-serif italic text-lg text-black mb-4">Vos Préférences Style</h5>

                {/* Style */}
                <div className="mb-5">
                  <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                    Style vestimentaire
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={chipBtn(register.style === s)}
                        onClick={() => setregister({ ...register, style: s })}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Couleurs */}
                <div className="mb-5">
                  <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                    Couleurs préférées
                  </label>
                  <input
                    type="text"
                    className={`${inputStyle} mb-0`}
                    placeholder="ex: noir, blanc, bleu..."
                    value={register.couleurs}
                    onChange={(e) => setregister({ ...register, couleurs: e.target.value })}
                  />
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                    Occasion principale
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={chipBtn(register.occasion === o)}
                        onClick={() => setregister({ ...register, occasion: o })}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STYLISTE FIELDS */}
          {register.role === "styliste" && (
            <div className="mt-2 mb-6 p-5 border-2 border-black border-dashed bg-[#FAF9F7]">
              <h5 className="font-serif italic text-lg text-black mb-4">Informations Styliste</h5>
              <input
                type="text"
                className={inputStyle}
                name="nom_marque"
                placeholder="Nom de la Marque"
                onChange={(e) => setregister({ ...register, nom_marque: e.target.value })}
              />
              <input
                type="text"
                className={inputStyle}
                name="adress"
                placeholder="Adresse Atelier/Boutique"
                onChange={(e) => setregister({ ...register, adress: e.target.value })}
              />
              <div className="mt-2">
                <label className="block font-black uppercase text-xs tracking-widest mb-2 text-black">
                  Upload Logo :
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-white border-2 border-black text-black font-bold text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r-2 file:border-black file:bg-[#e6ff00] file:text-black file:font-black file:uppercase file:text-xs file:tracking-widest hover:file:bg-black hover:file:text-[#e6ff00] transition-all cursor-pointer"
                  name="logo"
                  onChange={(e) => setregister({ ...register, logo: e.target.files[0] })}
                />
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-black text-white text-sm font-black uppercase tracking-widest border-2 border-black hover:bg-[#e6ff00] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="mt-8 text-center text-sm font-bold uppercase tracking-widest">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-black underline decoration-2 decoration-[#e6ff00] hover:bg-[#e6ff00] transition-colors p-1"
            >
              Connecte-toi
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;