/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Gestionnaire des commandes WhatsApp
 * ======================================================
 */

const fs = require("fs");
const path = require("path");
const downloader = require("../features/downloader");
const ai = require("../features/ai");

module.exports = async (sock, msg, logger, settings) => {
  try {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || from;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    const prefix = settings.prefix;
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const isOwner = settings.owner.includes(sender);

    // 🔒 Mode privé
    if (settings.mode === "private" && !isOwner) {
      return sock.sendMessage(from, {
        text: "⛔ Bot en mode privé."
      });
    }

    logger.info(`📩 Commande: ${command} | De: ${sender}`);

    switch (command) {
      case "menu":
        await sock.sendMessage(from, {
          text: `
🤖 *ÑĞĮĻJÃ_ÑĪJ - MENU*

📌 Commandes générales
• ${prefix}menu
• ${prefix}ping

⬇️ Téléchargements
• ${prefix}yta <lien>
• ${prefix}ytv <lien>
• ${prefix}tt <lien>
• ${prefix}ig <lien>

🧠 Intelligence Artificielle
• ${prefix}ai <question>

⚙️ Owner
• ${prefix}public
• ${prefix}private
• ${prefix}restart
`
        });
        break;

      case "ping":
        await sock.sendMessage(from, { text: "🏓 Pong !" });
        break;

      case "public":
        if (!isOwner) return;
        settings.mode = "public";
        fs.writeFileSync("./config/settings.json", JSON.stringify(settings, null, 2));
        await sock.sendMessage(from, { text: "✅ Mode public activé." });
        break;

      case "private":
        if (!isOwner) return;
        settings.mode = "private";
        fs.writeFileSync("./config/settings.json", JSON.stringify(settings, null, 2));
        await sock.sendMessage(from, { text: "🔒 Mode privé activé." });
        break;

      case "restart":
        if (!isOwner) return;
        await sock.sendMessage(from, { text: "♻️ Redémarrage du bot..." });
        process.exit(0);
        break;

      case "yta":
      case "ytv":
      case "tt":
      case "ig":
        await downloader(sock, from, command, args);
        break;

      case "ai":
        await ai(sock, from, args.join(" "));
        break;

      default:
        await sock.sendMessage(from, {
          text: "❓ Commande inconnue. Tape *menu*."
        });
    }

  } catch (err) {
    logger.error("❌ Erreur handler :", err);
  }
};