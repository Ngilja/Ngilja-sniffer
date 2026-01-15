/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - IA
 * ======================================================
 *  Commandes IA en français
 *  (Gemini / GPT)
 */

const axios = require("axios");
const { GEMINI_API_KEY } = process.env; // Ajouter ta clé Gemini dans les variables d'environnement

module.exports = async (sock, m, args, logger) => {
  try {
    if (!args[0]) {
      return sock.sendMessage(m.key.remoteJid, {
        text:
          "❌ *Question manquante*\n\n" +
          "Utilisation :\n" +
          "💬 *.ia <votre question>*\n\n" +
          "🤖 *ÑĞĮĻJÃ_ÑĪJ*"
      });
    }

    const prompt = args.join(" ");
    logger.info(`🧠 Question IA : ${prompt}`);

    // Appel API Gemini
    const response = await axios.post(
      "https://api.gemini.com/v1/ai/generate",
      {
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.text || "❌ Pas de réponse reçue.";

    await sock.sendMessage(m.key.remoteJid, {
      text: `🤖 *ÑĞĮĻJÃ_ÑĪJ IA* :\n\n${answer}`
    });

  } catch (err) {
    logger.error("❌ Erreur IA :", err);

    await sock.sendMessage(m.key.remoteJid, {
      text: "❌ Erreur lors de la génération de la réponse IA."
    });
  }
};