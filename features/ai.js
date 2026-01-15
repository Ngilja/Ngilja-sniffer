/**
 * Intelligence Artificielle
 * GPT ou Gemini, putain de choix
 */

const config = require('../../config/settings.json');

async function processAI(prompt) {
    try {
        // Implémentation Gemini (exemple)
        if (config.AI_PROVIDER === 'gemini' && config.AI_API_KEY) {
            // Code pour Gemini API
            return `Réponse IA pour: ${prompt}\n\n(C'est une putain de réponse simulée, configure ton API!)`;
        }
        
        // Fallback
        return `Demande IA reçue: "${prompt}"\nConfigure ton putain d'API dans settings.json!`;
    } catch (err) {
        return 'Erreur IA, bordel! ' + err.message;
    }
}

module.exports = { processAI };