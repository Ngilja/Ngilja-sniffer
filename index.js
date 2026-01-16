/**
 * ÑĞĮĻJÃ_ÑĪJ Bot - Point d'entrée principal
 * Node.js + WhatsApp MD + Telegram + AI
 * Tous les modules sont importés ici et initialisés
 */

console.log("🚀 Démarrage de ÑĞĮĻJÃ_ÑĪJ Bot...");

// Importer les modules nécessaires
const fs = require("fs");
const path = require("path");

// Charger la configuration
const config = require("./config/settings.json");

// WhatsApp
const waConnect = require("./whatsapp/connect");
const waHandler = require("./whatsapp/handler");
const waEvents = require("./whatsapp/events");

// Telegram
const tgBot = require("./telegram/bot");

// Features
const antidelete = require("./features/antidelete");
const antiviewonce = require("./features/antiviewonce");
const antical = require("./features/antical");
const downloader = require("./features/downloader");
const ai = require("./features/ai");

// Initialisation WhatsApp
(async () => {
  try {
    console.log("📱 Initialisation WhatsApp...");
    const waClient = await waConnect();
    waEvents(waClient); // écouter tous les événements WhatsApp
    waHandler(waClient); // gérer les messages
    antidelete(waClient);
    antiviewonce(waClient);
    antical(waClient);
    downloader(waClient);
    ai(waClient, config.geminiApiKey); // AI intégrée
    console.log("✅ WhatsApp prêt !");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation WhatsApp :", err);
  }
})();

// Initialisation Telegram
(async () => {
  try {
    console.log("🤖 Initialisation Telegram...");
    tgBot(config.telegramApiKey, config.botName);
    console.log("✅ Telegram prêt !");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation Telegram :", err);
  }
})();

// Afficher le mode du bot
console.log(`🔹 Mode : ${config.mode}`);
console.log(`🔹 Bot Name : ${config.botName}`);
console.log("🎉 ÑĞĮĻJÃ_ÑĪJ Bot est en ligne !");