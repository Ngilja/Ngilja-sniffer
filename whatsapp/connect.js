/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Connexion WhatsApp Multi-Device
 * ======================================================
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@adiwajshing/baileys");

const path = require("path");
const fs = require("fs-extra");

module.exports = async (logger, settings) => {
  // Dossier de session WhatsApp
  const authPath = path.join(__dirname, "../auth_info");

  // Charger / créer la session
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  // Créer la connexion WhatsApp
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // ❌ PAS DE QR
    logger,
    browser: ["ÑĞĮĻJÃ_ÑĪJ", "Chrome", "1.0.0"]
  });

  // Sauvegarde automatique de la session
  sock.ev.on("creds.update", saveCreds);

  // Gestion connexion / déconnexion
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      logger.info(`🔐 Code WhatsApp généré : ${pairingCode}`);
      logger.info("📲 Entrez ce code dans WhatsApp > Appareils liés");
    }

    if (connection === "open") {
      logger.info("✅ WhatsApp connecté avec succès !");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        logger.error("❌ Déconnecté de WhatsApp (session supprimée)");
      } else {
        logger.warn("⚠️ Connexion perdue, reconnexion...");
        module.exports(logger, settings);
      }
    }
  });

  // Charger les événements WhatsApp
  require("./events")(sock, logger, settings);

  return sock;
};