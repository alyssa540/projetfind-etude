const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/', async (req, res) => {
    try {
        // 1. Nthabtou l'clé tchargiet wala le 9bal ma nkalmou Google
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("❌ ERREUR: L'API Key mouch mawjouda! Thabet l'fichier .env");
            return res.status(500).json({ error: "API Key manquante" });
        } else {
            console.log("✅ L'API Key te9rat mrigla! (Longueur: " + apiKey.length + " caractères)");
        }

        // 2. Initialisation mtaa Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Njarbou b'gemini-pro bech netfedew l'erreur 404 mtaa l'flash ken l'package 9dim
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        const { style, couleurs, occasion } = req.body;

        const prompt = `Je suis un client qui cherche des vêtements. Mon style préféré est "${style || 'chic'}", j'aime les couleurs "${couleurs || 'noir'}", et c'est pour une occasion : "${occasion || 'soirée'}". 
        Donne-moi une liste de 3 suggestions de vêtements exacts. 
        Réponds UNIQUEMENT avec les noms des vêtements séparés par des virgules. Ne dis rien d'autre.`;

        // 3. Nkalmou Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Formatage lel React
        const recommendations = text.split(',').map(item => item.trim()).filter(item => item !== "");
        res.status(200).json({ recommended_ids: recommendations });

    } catch (error) {
        console.error("❌ Erreur Gemini détaillée:", error);
        res.status(500).json({ error: "Erreur lors de la communication avec l'IA." });
    }
});

module.exports = router;