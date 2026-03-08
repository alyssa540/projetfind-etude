const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product"); // <-- N'oublie pas d'importer le modèle Product !
const isAuth = require("../middleware/passport");

// @route   POST api/orders/add
// @desc    Passer une commande (Client uniquement)
// @access  Private
router.post("/add", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(401).send({ msg: "Seuls les clients peuvent passer commande." });
    }

    const { produitId, tailleChoisie } = req.body;

    const newOrder = new Order({
      clientId: req.user._id,
      produitId,
      tailleChoisie,
    
    });

    const savedOrder = await newOrder.save();
    res.status(200).send({ order: savedOrder, msg: "Commande passée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la commande" });
  }
});

// @route   GET api/orders/my-orders
// @desc    Voir l'historique de ses commandes (Client)
// @access  Private
router.get("/my-orders", isAuth(), async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user._id }).populate("produitId");
    res.status(200).send({ orders, msg: "Historique récupéré" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur serveur" });
  }
});

// =========================================================================
// NOUVELLE ROUTE AJOUTÉE : Pour que le styliste voit les commandes reçues
// =========================================================================
// @route   GET api/orders/stylist
// @desc    Récupérer les commandes passées sur les vêtements du styliste
// @access  Private
router.get("/stylist", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }

    // 1. On cherche d'abord tous les vêtements créés par CE styliste
    const mesProduits = await Product.find({ stylisteId: req.user._id }).select("_id");
    
    // On extrait juste les IDs de ces produits dans un tableau
    const mesProduitsIds = mesProduits.map((produit) => produit._id);

    // 2. On cherche toutes les commandes qui contiennent un de ces produits
    // On utilise populate pour récupérer les infos du client (nom, email) et du produit (titre)
    const orders = await Order.find({ produitId: { $in: mesProduitsIds } })
      .populate("produitId", "titre image prix") // On ramène le titre et l'image du vêtement
      .populate("clientId", "name lastname email"); // On ramène le nom et l'email du client acheteur

    res.status(200).send({ orders, msg: "Commandes du styliste récupérées avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des commandes du styliste" });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Changer le statut d'une commande (Styliste uniquement)
// @access  Private
router.put("/:id/status", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }

    const { statut } = req.body; // 'confirmee' ou 'declinee'

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { statut: statut } },
      { new: true } // Retourne le document mis à jour
    );

    res.status(200).send({ order: updatedOrder, msg: "Statut de la commande mis à jour" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la mise à jour" });
  }
});

module.exports = router;