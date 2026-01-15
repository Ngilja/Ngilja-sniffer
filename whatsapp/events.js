/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Gestion des événements WhatsApp
 * ======================================================
 */

const handleMessage = require("./handler");
const antiDelete = require("../features/antidelete");
const antiViewOnce = require("../features/antiviewonce");
const antiCall = require("../features/antical");

module.exports = (sock, logger, settings) => {

  /**
   * 📩 Messages entrants
   */
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg.message) return;

    try {
      // Anti view-once
      await antiViewOnce(sock, msg, settings);

      // Gestion commandes & messages
      await handleMessage(sock, msg, logger, settings);
    } catch (err) {
      logger.error("❌ Erreur message :", err);
    }
  });

  /**
   * 🗑️ Anti-delete
   */
  sock.ev.on("messages.update", async (updates) => {
    for (const update of updates) {
      if (update.update?.message === null) {
        await antiDelete(sock, update, settings);
      }
    }
  });

  /**
   * 📞 Anti-appel WhatsApp
   */
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      await antiCall(sock, call, settings);
    }
  });

};