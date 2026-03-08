const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const isAuth = require("../middleware/passport");

// @route   POST api/comments/add/:articleId
// @desc    Ajouter un commentaire sous un article (Client uniquement)
// @access  Private
router.post("/add/:articleId", isAuth(), async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(401).send({ msg: "Seuls les clients peuvent laisser des commentaires." });
    }

    const { texte } = req.body;
    const { articleId } = req.params;

    const newComment = new Comment({
      articleId,
      clientId: req.user._id,
      texte,
    });

    const savedComment = await newComment.save();
    res.status(200).send({ comment: savedComment, msg: "Commentaire ajouté" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de l'ajout du commentaire" });
  }
});

// @route   GET api/comments/article/:articleId
// @desc    Récupérer tous les commentaires d'un article spécifique
// @access  Public
router.get("/article/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // On cherche les commentaires liés à cet article et on peuple les infos du client
    const comments = await Comment.find({ articleId }).populate("clientId", "name lastname");
    
    res.status(200).send({ comments, msg: "Commentaires récupérés" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Erreur lors de la récupération des commentaires" });
  }
});

module.exports = router;