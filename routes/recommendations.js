const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');
const User = require('../models/User');
const isAuth = require('../middleware/passport');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

router.get('/', isAuth(), async (req, res) => {
    try {
        const dbUser = await User.findById(req.user._id).select('preferences');
        const { style, couleurs, occasion } = dbUser?.preferences || {};

        // 1. Fetch all active products (⚠️ Fix: zedna 'couleurs' fil select bech tطابق الـ Schema)
        const products = await Product.find({ isArchived: { $ne: true } })
            .select('_id titre description prix image style couleurs occasion categorie');

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        // 2. Linearize catalogue as plain data with real database IDs
        const catalogueData = products.map(p => ({
            id: p._id.toString(),
            titre: p.titre,
            categorie: p.categorie,
            style: p.style,
            couleurs: p.couleurs,
            occasion: p.occasion,
            description: p.description
        }));

      
        const prompt = `[CONTEXTE]
Tu es un moteur de recommandation e-commerce pour une application de mode. Ton rôle est d'analyser le catalogue et de sélectionner les articles qui correspondent le mieux aux préférences du client.

[CATALOGUE VÊTEMENTS]
${JSON.stringify(catalogueData, null, 2)}

[PRÉFÉRENCES CLIENT]
- Style : ${style || 'Peu importe'}
- Couleurs : ${couleurs || 'Peu importe'}
- Occasion : ${occasion || 'Peu importe'}

[CONSIGNE STRICTE]
Renvoie UNIQUEMENT un tableau JSON contenant les "id" des produits sélectionnés .
Exemple de format attendu:
[
  "64bbf...",
  "64bc0..."
]`;

      
        const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: 'json' 
        });

       
        let recommendedIds = [];
        try {
            recommendedIds = JSON.parse(ollamaRes.data.response.trim());
        } catch (parseErr) {
            console.error("❌ Erreur parsing JSON Ollama:", parseErr.message);
            return res.status(200).json({ products: [] });
        }

        if (!Array.isArray(recommendedIds)) {
            console.log("Ollama n'a pas renvoyé un Array:", recommendedIds);
            return res.status(200).json({ products: [] });
        }

      
        const recommended = products.filter(p => recommendedIds.includes(p._id.toString()));

        res.status(200).json({ products: recommended });

    } catch (error) {
        console.error("❌ Erreur recommandation:", error.message);
        res.status(500).json({ error: "Erreur lors de la recommandation." });
    }
});

module.exports = router;