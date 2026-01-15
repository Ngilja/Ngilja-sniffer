/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Anti Delete (anti suppression)
 * ======================================================
 *  Restaure les messages supprimés
 */

module.exports = async (sock, update, logger) => {
  try {
    if (!update.messages) return;

    const msg = update.messages[0];

    // Message supprimé
    if (msg.messageStubType === 68) {
      const from = msg.key.remoteJid;
      const deleter = msg.key.participant || from;

      logger.info("🛑 Message supprimé détecté");

      await sock.sendMessage(from, {
        text: `
🛑 *ANTI-DELETE ACTIVÉ*

👤 Auteur : ${deleter}
📩 Un message a été supprimé.
`
      });
    }

  } catch (err) {
    logger.error("❌ Erreur anti-delete :", err);
  }
};