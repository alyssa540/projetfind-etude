const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isAuth = require("../middleware/passport");

// @route   GET api/admin/users
// @desc    Récupérer la liste de TOUS les utilisateurs (Clients & Stylistes)
// @access  Private (Admin uniquement)
router.get("/users", isAuth(), async (req, res) => {
  try {
    // Vérification stricte du rôle
    if (req.user.role !== "admin") {
      return res.status(403).send({ msg: "Accès refusé. Réservé aux administrateurs." });
    }

    // On récupère tous les utilisateurs sauf les admins (optionnel)
    // On exclut le mot de passe de la réponse pour des raisons de sécurité (-password)
    const users = await User.find({ role: { $ne: 'admin' } }).select("-password");
    
    res.status(200).send({ users, msg: "Liste des utilisateurs récupérée" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des utilisateurs" });
  }
});

// @route   PUT api/admin/users/:id/block
// @desc    Bloquer ou débloquer un utilisateur (Client ou Styliste)
// @access  Private (Admin uniquement)
router.put("/users/:id/block", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ msg: "Accès refusé. Réservé aux administrateurs." });
    }

  
    const userToBlock = await User.findById(req.params.id);

    if (!userToBlock) {
      return res.status(404).send({ msg: "Utilisateur introuvable" });
    }

   
    userToBlock.estBloque = !userToBlock.estBloque;
    
    await userToBlock.save();

    const action = userToBlock.estBloque ? "bloqué" : "débloqué";
    res.status(200).send({ user: userToBlock, msg: `L'utilisateur a été ${action} avec succès.` });

  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la modification du statut de l'utilisateur" });
  }
});

module.exports = router;