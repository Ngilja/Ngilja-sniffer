/**
 * Configuration et constantes du bot
 */

const config = require('./settings.json');

// Exporter la configuration
module.exports = {
  // Informations du bot
  BOT_NAME: config.botName,
  OWNER_NUMBER: config.ownerNumber,
  OWNER_NAME: config.ownerName,
  VERSION: config.version,
  
  // WhatsApp
  WHATSAPP: {
    PAIRING_CODE: config.whatsapp.pairingCode,
    BROWSER: config.whatsapp.browser,
    MAX_RETRIES: config.whatsapp.maxRetries
  },
  
  // Telegram
  TELEGRAM: {
    ENABLED: config.telegram.enabled,
    TOKEN: config.telegram.token,
    OWNER_ID: config.telegram.ownerId
  },
  
  // Features
  FEATURES: config.features,
  
  // Paths
  PATHS: config.paths,
  
  // AI
  AI: config.ai,
  
  // URLs importantes
  URLS: {
    REPOSITORY: "https://github.com/TON_USERNAME/ngilja-nij",
    DOCUMENTATION: "https://github.com/TON_USERNAME/ngilja-nij#readme"
  }
};