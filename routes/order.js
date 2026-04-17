const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product"); 
const isAuth = require("../middleware/passport");

// @route   POST api/orders/add
// @desc    Passer une nouvelle commande (Client)
router.post("/add", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "client") return res.status(401).send({ msg: "Seuls les clients peuvent passer commande." });
    
    // On récupère les infos du req.body
    const { produitId, tailleChoisie, quantite, adresseLivraison, telephoneContact } = req.body;
    
    // On les met dans la nouvelle commande
    const newOrder = new Order({ 
        clientId: req.user._id, 
        produitId, 
        tailleChoisie, 
        quantite,
        adresseLivraison, 
        telephoneContact 
    });
    
    const savedOrder = await newOrder.save();
    res.status(200).send({ order: savedOrder, msg: "Commande passée avec succès" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la commande" });
  }
});

// @route   GET api/orders/my-orders
// @desc    Récupérer l'historique des commandes (Client)
router.get("/my-orders", isAuth(), async (req, res) => {
  try {
    const orders = await Order.find({ clientId: req.user._id })
      .populate({
        path: "produitId",
        populate: { path: "stylisteId", select: "name lastname" }
      });
    res.status(200).send({ orders, msg: "Historique récupéré" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur serveur" });
  }
});

// @route   PUT api/orders/:id/cancel
// @desc    Permettre au client d'annuler sa commande si elle est "en_attente"
router.put("/:id/cancel", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(401).send({ msg: "Seuls les clients peuvent annuler leurs commandes." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ msg: "Commande introuvable." });
    }

    if (order.clientId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ msg: "Non autorisé à modifier cette commande." });
    }

    // On vérifie que le statut est bien "en_attente" d'après ton Schema
    if (order.statut !== "en_attente") {
      return res.status(400).send({ msg: "Impossible d'annuler une commande déjà validée ou expédiée." });
    }

    // 🔥 L'ASTUCE ICI 🔥
    // On utilise findByIdAndUpdate bech nbaddlou l'statut direct 
    // men ghir ma n'declenchiw l'validation mtaa les autres champs (kima adresseLivraison)
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id, 
        { statut: "annulee" },
        { new: true } 
    );

    res.status(200).send({ order: updatedOrder, msg: "Commande annulée avec succès." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de l'annulation de la commande." });
  }
});

// @route   GET api/orders/stylist
// @desc    Récupérer les commandes en cours (Styliste)
router.get("/stylist", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") return res.status(401).send({ msg: "Non autorisé" });

    const mesProduits = await Product.find({ stylisteId: req.user._id }).select("_id");
    const mesProduitsIds = mesProduits.map((produit) => produit._id);

    const orders = await Order.find({ 
      produitId: { $in: mesProduitsIds }, 
      estArchivee: { $ne: true } 
    })
      .populate("produitId", "titre image prix") 
      .populate("clientId", "name lastname email");

    res.status(200).send({ orders, msg: "Commandes du styliste récupérées avec succès" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la récupération des commandes du styliste" });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Changer le statut d'une commande (Styliste)
router.put("/:id/status", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") return res.status(401).send({ msg: "Non autorisé" });
    const { statut } = req.body; 
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { $set: { statut: statut } }, { new: true });
    res.status(200).send({ order: updatedOrder, msg: "Statut de la commande mis à jour" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la mise à jour" });
  }
});

// @route   PUT api/orders/:id/archive
// @desc    Archiver une commande terminée ou annulée (Styliste)
router.put("/:id/archive", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") return res.status(401).send({ msg: "Non autorisé" });
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: { estArchivee: true } }, 
      { new: true }
    );
    res.status(200).send({ order: updatedOrder, msg: "Commande archivée avec succès" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de l'archivage" });
  }
});

// @route   GET api/orders/stylist/archives
// @desc    Récupérer les archives (Styliste)
router.get("/stylist/archives", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }

    const mesProduits = await Product.find({ stylisteId: req.user._id }).select("_id");
    const mesProduitsIds = mesProduits.map((produit) => produit._id);

    const archives = await Order.find({ 
      produitId: { $in: mesProduitsIds }, 
      estArchivee: true 
    })
      .populate("produitId") 
      .populate("clientId", "name lastname email");

    res.status(200).send({ archives, msg: "Archives récupérées avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des archives" });
  }
});

module.exports = router;