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

        // 1. Fetch all active products from the catalogue
        const products = await Product.find({ isArchived: { $ne: true } })
            .select('_id titre description prix image style couleur occasion categorie');

        if (products.length === 0) {
            return res.status(200).json({ products: [] });
        }

        // 2. Build a numbered list for Ollama 
        const catalogue = products
            .map((p, i) => {
                const attrs = [
                    `Catégorie: ${p.categorie || 'N/A'}`,
                    `Style: ${p.style || 'N/A'}`,
                    `Couleur: ${p.couleur || 'N/A'}`,
                    `Occasion: ${p.occasion || 'N/A'}`
                ].join(', ');
                return `${i + 1}. [${attrs}] ${p.titre} - ${p.description}`;
            })
            .join('\n');

        // 👇 PROMPT AMÉLIORÉ : Strict, direct et formaté pour éviter le blabla de l'IA
        const prompt = `[CONTEXTE]
Tu es un moteur de recommandation e-commerce pour une application de mode. Ton rôle est d'analyser un catalogue et de renvoyer UNIQUEMENT les identifiants numériques des articles correspondants.

[CATALOGUE VÊTEMENTS]
${catalogue}

[PRÉFÉRENCES CLIENT]
- Style : ${style || 'Peu importe'}
- Couleurs : ${couleurs || 'Peu importe'}
- Occasion : ${occasion || 'Peu importe'}

[CONSIGNES STRICTES DE RÉPONSE]
1. Sélectionne entre 1 et 5 articles maximum qui correspondent le mieux aux préférences.
2. Ne fais AUCUNE phrase. Ne donne AUCUNE explication. Ne dis pas "Bonjour" ni "Voici votre sélection".
3. Ne mets pas de texte avant ou après les chiffres.
4. Renvoie UNIQUEMENT les numéros des articles séparés par des virgules (ex: 1, 4, 7).`;

        // 3. Ask Ollama
        const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
        });

        // 4. Parse returned indices (Version ultra-sécurisée)
        const raw = ollamaRes.data.response.trim();
        
        // Extraction des numéros présents dans la réponse
        const matchedNumbers = raw.match(/\d+/g); 
        
        if (!matchedNumbers) {
            console.log("Ollama n'a pas renvoyé de numéros valides:", raw);
            return res.status(200).json({ products: [] });
        }

        // Nettoyage : On élimine les doublons potentiels générés par l'IA
        const uniqueNumbers = [...new Set(matchedNumbers)];

        // Conversion en index JavaScript (on fait -1) et filtrage de sécurité
        const indices = uniqueNumbers
            .map(n => parseInt(n, 10) - 1)
            .filter(i => i >= 0 && i < products.length); // On s'assure que l'index existe dans le tableau

        // Récupération des objets produits correspondants
        const recommended = indices.map(i => products[i]).filter(Boolean);

        res.status(200).json({ products: recommended });

    } catch (error) {
        console.error("❌ Erreur recommandation:", error.message);
        res.status(500).json({ error: "Erreur lors de la recommandation." });
    }
});

module.exports = router;