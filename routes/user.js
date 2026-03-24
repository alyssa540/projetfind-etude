const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  loginRules,
  registerRules,
  validation,
} = require("../middleware/validator");
const isAuth = require("../middleware/passport");

//register
router.post("/register", registerRules(), validation, async (req, res) => {
  const { name, lastname, email, password ,role, taille, adress, phone } = req.body;
  try {
    const newUser = new User({ name, lastname, email, password, role, taille, adress, phone });
    // check if the email exist
    const searchedUser = await User.findOne({ email });

    if (searchedUser) {
      return res.status(400).send({ msg: "email already exist" });
    }

    // hash password
    const salt = 10;
    const genSalt = await bcrypt.genSalt(salt);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    console.log(hashedPassword);
    newUser.password = hashedPassword;
    // generation token
    //save  the user
    const newUserToken = await newUser.save();
    const payload = {
      _id: newUser._id,
      name: newUserToken.name,
    };
    const token = await jwt.sign(payload, process.env.SecretOrkey, {
      expiresIn: 3600,
    });

    res
      .status(200)
      .send({ newUserToken, msq: "user is saved", token: `bearer ${token}` });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
//login
router.post("/login", loginRules(), validation, async (req, res) => {
  const { email, password } = req.body;
  try {
    //find if the user exist
    const searchedUser = await User.findOne({ email });
    //find if the email not exist
    if (!searchedUser) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    //if password are equal
    const match = await bcrypt.compare(password, searchedUser.password);
    if (!match) {
      return res.status(400).send({ msg: "Bad credential" });
    }
    //creer un token
    const payload = {
      _id: searchedUser._id,
      name: searchedUser.name,
    };
    const token = await jwt.sign(payload, process.env.SecretOrKey, {
      expiresIn: 3600,
    });
    //console.log(token)
    //send the user
    res
      .status(200)
      .send({ user: searchedUser, msg: "success", token: `bearer ${token}` });
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
    // Le .select('-password') est très important : il empêche d'envoyer les mots de passe !
    const users = await User.find().select('-password'); 
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la récupération des utilisateurs", error });
  }
});
// PUT : Modifier le profil d'un utilisateur (par son ID)
router.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // 🚨 Petite sécurité : Si l'utilisateur essaie de modifier son mot de passe ici, 
    // il faudrait le crypter d'abord. Mais pour l'instant, on bloque la modification du mot de passe via cette route.
    if (req.body.password) {
      delete req.body.password; 
    }

    // On cherche l'utilisateur et on le met à jour
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: req.body }, // On met à jour avec les infos reçues du Front
      { new: true }       // On demande à MongoDB de nous renvoyer le profil mis à jour
    ).select("-password"); // 🛡️ Très important : on cache le mot de passe dans la réponse pour la sécurité !

    if (!updatedUser) {
      return res.status(404).send({ msg: "Utilisateur introuvable" });
    }

    res.status(200).send({ msg: "Profil mis à jour avec succès !", user: updatedUser });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la modification du profil", error });
  }
});
module.exports = router;
