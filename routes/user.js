const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // 👈 ZEDNA MULTER HOUNI
const {
  loginRules,
  registerRules,
  validation,
} = require("../middleware/validator");
const isAuth = require("../middleware/passport");

// ==========================================
// 👇 CONFIGURATION MULTER (Bech ysob tsawer)
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // L'dossier win bech nkhabiw tsawer
  },
  filename: function (req, file, cb) {
    // Nbadlou esm taswira bech mayssirch mochkel ken zouz 3bed habtou taswira b nafs l'esm
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ==========================================
// REGISTER (Tawa ya9bel taswira b upload.single('logo'))
// ==========================================
// 🚨 IMPORTANT : 'upload.single("logo")' yelzem tji 9bal registerRules bech yefhem l'body
router.post("/register", upload.single("logo"), registerRules(), validation, async (req, res) => {
  // Zedna nom_marque w logo
  const { name, lastname, email, password, role, taille, adress, phone, nom_marque, style, couleurs, occasion } = req.body;

  try {
    // check if the email exist
    const searchedUser = await User.findOne({ email });
    if (searchedUser) {
      return res.status(400).send({ msg: "email already exist" });
    }

    // Nriglou l'lien mtaa l'logo ken l'client b3ath taswira
    let logoUrl = "";
    if (req.file) {
      logoUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Baddel l'port ken backend mte3ek mouch 5000
    }

    const newUser = new User({
      name, lastname, email, password, role, taille, adress, phone, nom_marque, logo: logoUrl,
      preferences: {
        style: style || 'casual',
        couleurs: couleurs || '',
        occasion: occasion || 'tous les jours'
      }
    });

    // hash password
    const salt = 10;
    const genSalt = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    newUser.password = hashedPassword;
    
    // save the user
    const newUserToken = await newUser.save();
    
    // generation token
    const payload = {
      _id: newUser._id,
      name: newUserToken.name,
    };
    const token = await jwt.sign(payload, process.env.SecretOrKey, {
      expiresIn: 3600,
    });

    res.status(200).send({ newUserToken, msg: "user is saved", token });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//login
router.post("/login", loginRules(), validation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const searchedUser = await User.findOne({ email });
    if (!searchedUser) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    const match = await bcrypt.compare(password, searchedUser.password);
    if (!match) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    const payload = {
      _id: searchedUser._id,
      name: searchedUser.name,
    };
    const token = await jwt.sign(payload, process.env.SecretOrKey, {
      expiresIn: 3600,
    });
    
    res.status(200).send({ user: searchedUser, msg: "success", token });
  } catch (error) {
    res.status(500).send({ msg: "Can not get the user" });
  }
});

router.get("/current", isAuth(), (req, res) => {
  res.status(200).send({ user: req.user });
});

// GET : Récupérer tous les utilisateurs
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la récupération des utilisateurs", error });
  }
});

// ==========================================
// UPDATE PROFIL (Connecté)
// ==========================================
// Zedtlek upload.single("logo") houni zeda, bech ken l'styliste yheb ybaddel l'logo mte3ou
// ==========================================
// UPDATE PROFIL (Connecté)
// ==========================================
router.put("/update-profile", isAuth(), upload.single("logo"), async (req, res) => {
  try {
    const { name, lastname, taille, adress, phone, nom_marque, style, couleurs, occasion } = req.body;

    // 👇 On initialise les champs communs ici
    let updateFields = { name, lastname };
    
    // 👇 On ajoute le téléphone pour tout le monde (s'il est envoyé)
    if (phone) updateFields.phone = phone;

    // --- Champs spécifiques Client ---
    if (req.user.role === "client") {
      if (taille) updateFields.taille = taille;
      if (adress) updateFields.adress = adress; // L'adresse peut être commune aussi, mais on la laisse là où tu l'as mise
      if (style !== undefined) updateFields['preferences.style'] = style;
      if (couleurs !== undefined) updateFields['preferences.couleurs'] = couleurs;
      if (occasion !== undefined) updateFields['preferences.occasion'] = occasion;
    }

    // --- Champs spécifiques Styliste ---
    if (req.user.role === "styliste") {
      if (adress) updateFields.adress = adress;
      if (nom_marque) updateFields.nom_marque = nom_marque;
      if (req.file) {
        updateFields.logo = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true } 
    ).select("-password");

    res.status(200).send({ msg: "Profil mis à jour", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur serveur lors de la mise à jour" });
  }
});

module.exports = router;