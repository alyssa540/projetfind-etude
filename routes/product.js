const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const isAuth = require("../middleware/passport");

// @route   POST api/products/add
// @desc    Ajouter une nouvelle création (Styliste uniquement)
// @access  Private
router.post("/add", isAuth(), async (req, res) => {
  try {
    // Vérification du rôle
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé. Espace réservé aux stylistes." });
    }

    const { titre, description, prix, taillesDisponibles, image } = req.body;

    const newProduct = new Product({
      titre,
      description,
      prix,
      taillesDisponibles,
      image,
      stylisteId: req.user._id, // L'ID vient du token décodé par isAuth
    });

    const savedProduct = await newProduct.save();
    res.status(200).send({ product: savedProduct, msg: "Création ajoutée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de l'ajout de la création" });
  }
});

// @route   GET api/products/all
// @desc    Récupérer tout le catalogue
// @access  Public (pas besoin de isAuth ici)
router.get("/all", async (req, res) => {
  try {
    // 👇 CORRECTION: Zedt { isArchived: { $ne: true } } bech l'produits l'm'archivin ma yodh'hrouch w l'9dom yodh'hrou
    const products = await Product.find({ isArchived: { $ne: true } }).populate("stylisteId", "name lastname");
    res.status(200).send({ products, msg: "Catalogue récupéré avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des produits" });
  }
});

// ==========================================
// 👇 NOUVELLE ROUTE : RÉCUPÉRER LES CRÉATIONS ARCHIVÉES 
// ==========================================
// @route   GET api/products/stylist/archives
// @desc    Récupérer les créations archivées du styliste connecté
// @access  Private
router.get("/stylist/archives", isAuth(), async (req, res) => {
  try {
    // Vérification elli houwa styliste
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }
    
    // 👇 CORRECTION ICI : isArchived: true
    const creationsArchivees = await Product.find({ 
      stylisteId: req.user._id, 
      isArchived: true 
    });
    
    res.status(200).send({ creations: creationsArchivees, msg: "Créations archivées récupérées avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des créations archivées" });
  }
});

// @route   DELETE api/products/:id
// @desc    Supprimer une création (Styliste uniquement)
// @access  Private
router.delete("/:id", isAuth(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ msg: "Produit introuvable" });
    }

    // Vérifier que le styliste qui supprime est bien le créateur du produit
    if (product.stylisteId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ msg: "Non autorisé à supprimer ce produit" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send({ msg: "Création supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la suppression" });
  }
});

// PUT : Modifier un produit (par son ID)
router.put("/:id",isAuth(), async (req, res) => {
  try {
    // On récupère l'ID du produit depuis l'URL (req.params.id)
    const productId = req.params.id;
    
    // On cherche le produit et on le met à jour avec les nouvelles infos du Body
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      { $set: req.body }, // On modifie seulement ce qu'on envoie
      { new: true }       // "new: true" permet de renvoyer le produit modifié, pas l'ancien
    );

    if (!updatedProduct) {
      return res.status(404).send({ msg: "Produit introuvable" });
    }

    res.status(200).send({ msg: "Produit mis à jour avec succès !", product: updatedProduct });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la modification", error });
  }
});

// @route   PUT api/products/:id/archive
// @desc    Archiver un produit (au lieu de le supprimer)
router.put("/:id/archive", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }
    
    // 👇 CORRECTION ICI : isArchived: true
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { $set: { isArchived: true } }, 
      { new: true }
    );
    
    res.status(200).send({ product: updatedProduct, msg: "Produit archivé avec succès" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de l'archivage du produit" });
  }
});
// @route   PUT api/products/:id/unarchive
// @desc    Désarchiver un produit (le remettre dans le catalogue)
router.put("/:id/unarchive", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Non autorisé" });
    }
    
    // 👇 Nraj3ou isArchived false
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      { $set: { isArchived: false } }, 
      { new: true }
    );
    
    res.status(200).send({ product: updatedProduct, msg: "Produit désarchivé avec succès" });
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors du désarchivage du produit" });
  }
});

module.exports = router;