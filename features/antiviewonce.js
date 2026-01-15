/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Anti View Once
 * ======================================================
 *  Supprime la protection "voir une seule fois"
 */

module.exports = async (sock, msg, logger) => {
  try {
    if (!msg.message) return;

    const viewOnce =
      msg.message.viewOnceMessageV2 ||
      msg.message.viewOnceMessageV2Extension;

    if (!viewOnce) return;

    const messageContent = viewOnce.message;
    const from = msg.key.remoteJid;

    logger.info("👁️ View Once détecté, suppression de la protection");

    // Renvoi du média sans view once
    await sock.sendMessage(from, {
      forward: {
        key: msg.key,
        message: messageContent
      }
    });

  } catch (err) {
    logger.error("❌ Erreur Anti View Once :", err);
  }
};