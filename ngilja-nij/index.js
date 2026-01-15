/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - BOT WHATSAPP MULTI-DEVICE
 *  Fichier principal (index.js)
 * ======================================================
 */

const fs = require("fs-extra");
const path = require("path");
const pino = require("pino");

// Charger la configuration
const settings = require("./config/settings.json");

// Logger propre
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard"
    }
  }
});

logger.info(`🚀 Lancement du bot ${settings.botName}...`);

// Vérifier les dossiers essentiels
const folders = [
  "whatsapp",
  "telegram",
  "features",
  "config",
  "auth_info"
];

folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    logger.info(`📁 Dossier créé : ${folder}`);
  }
});

// Lancer WhatsApp
try {
  require("./whatsapp/connect")(logger, settings);
  logger.info("📱 Module WhatsApp chargé");
} catch (err) {
  logger.error("❌ Erreur module WhatsApp :", err);
}

// Lancer Telegram
try {
  require("./telegram/bot")(logger, settings);
  logger.info("🤖 Bot Telegram chargé");
} catch (err) {
  logger.error("❌ Erreur module Telegram :", err);
}

logger.info(`✅ ${settings.botName} est prêt et en ligne !`);