/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Fichier principal
 * ======================================================
 *  Lancement du bot WhatsApp MD et Telegram
 */

const fs = require("fs");
const path = require("path");

// Charger la configuration
const settings = require("./config/settings.json");

// Logger simple
const logger = {
  info: console.log,
  error: console.error
};

// ------------------------------------------------------
// 1️⃣ Lancer WhatsApp
// ------------------------------------------------------
const { connectWA } = require("./whatsapp/connect");
connectWA(settings, logger)
  .then(sock => {
    logger.info("✅ WhatsApp prêt !");
    // Importer le handler principal
    require("./whatsapp/handler")(sock, logger);
  })
  .catch(err => {
    logger.error("❌ Erreur WhatsApp :", err);
  });

// ------------------------------------------------------
// 2️⃣ Lancer Telegram
// ------------------------------------------------------
const startTelegramBot = require("./telegram/bot");
startTelegramBot(settings, logger);

// ------------------------------------------------------
// 3️⃣ Message d'accueil
// ------------------------------------------------------
logger.info(`
==================================
   🤖 ÑĞĮĻJÃ_ÑĪJ Bot MD
   ✅ WhatsApp + Telegram
   ⚡ Tout est prêt
==================================
`);