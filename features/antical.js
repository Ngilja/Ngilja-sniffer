/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Anti Appel WhatsApp
 * ======================================================
 *  Bloque automatiquement les appels entrants
 */

module.exports = async (sock, call, logger) => {
  try {
    const from = call.from;

    logger.warn(`📞 Appel bloqué de ${from}`);

    // Message d'avertissement
    await sock.sendMessage(from, {
      text:
        "🚫 *Appel bloqué*\n\n" +
        "Ce bot ne reçoit pas d'appels.\n" +
        "Veuillez utiliser les commandes par message.\n\n" +
        "🤖 *ÑĞĮĻJÃ_ÑĪJ*"
    });

    // Rejeter l'appel
    await sock.rejectCall(call.id, call.from);

    // Optionnel : bloquer l'utilisateur
    // await sock.updateBlockStatus(from, "block");

  } catch (err) {
    logger.error("❌ Erreur Anti Appel :", err);
  }
};