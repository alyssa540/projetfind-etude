const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const isAuth = require("../middleware/passport");

// @route   POST api/articles/add
// @desc    Créer un nouvel article de blog (Styliste uniquement)
// @access  Private
router.post("/add", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "styliste") {
      return res.status(401).send({ msg: "Seuls les stylistes peuvent écrire des articles." });
    }

    const { titre, contenu } = req.body;

    const newArticle = new Article({
      titre,
      contenu,
      auteurId: req.user._id,
    });

    const savedArticle = await newArticle.save();
    res.status(200).send({ article: savedArticle, msg: "Article publié avec succès !" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la publication de l'article" });
  }
});

// @route   GET api/articles/all
// @desc    Récupérer tous les articles du blog
// @access  Public
router.get("/all", async (req, res) => {
  try {
    // On peuple 'auteurId' pour avoir le nom du styliste directement
    const articles = await Article.find().populate("auteurId", "name lastname");
    res.status(200).send({ articles, msg: "Articles récupérés" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur serveur" });
  }
});

// @route   PUT api/articles/:id
// @desc    Modifier un article (Styliste propriétaire uniquement)
// @access  Private
router.put("/:id", isAuth(), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send({ msg: "Article introuvable" });
    }

    // Vérifier que le styliste est bien l'auteur de l'article
    if (article.auteurId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ msg: "Vous ne pouvez modifier que vos propres articles." });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Met à jour avec les nouvelles données (titre, contenu)
      { new: true }
    );

    res.status(200).send({ article: updatedArticle, msg: "Article mis à jour" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la modification" });
  }
});

// @route   DELETE api/articles/:id
// @desc    Supprimer un article (Styliste propriétaire uniquement)
// @access  Private
router.delete("/:id", isAuth(), async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).send({ msg: "Article introuvable" });
    }

    if (article.auteurId.toString() !== req.user._id.toString()) {
      return res.status(401).send({ msg: "Vous ne pouvez supprimer que vos propres articles." });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.status(200).send({ msg: "Article supprimé avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la suppression" });
  }
});

module.exports = router;