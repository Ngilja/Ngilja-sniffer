/**
 * ÑĞĮĻJÃ_ÑĪJ - Module IA
 * Fichier : features/ai.js
 *
 * Fonctionnalités :
 * - Répondre aux commandes IA en français
 * - Compatible avec WhatsApp et Telegram
 * - Supporte GPT/Gemini via API Key
 */

const axios = require('axios');
const GEMINI_API_KEY = 'AIzaSyB-ccag-IPwQkxn9NCGzGK1nfKKLALIe3E'); // Clé API Gemini

/**
 * Appelle l'API Gemini pour générer une réponse IA
 * @param {string} prompt - La question ou commande de l'utilisateur
 * @returns {Promise<string>} - La réponse générée
 */
async function generateResponse(prompt) {
    try {
        const response = await axios.post(
            'https://gemini.api.google.com/v1/complete',
            {
                model: 'gemini-1',
                prompt: prompt,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${GEMINI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Retourner la réponse textuelle
        return response.data?.choices?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
        console.error('Erreur IA :', error.message);
        return "Erreur lors de l'appel à l'IA.";
    }
}

module.exports = {
    generateResponse
};