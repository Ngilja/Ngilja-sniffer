/**
 * ======================================================
 *  ÑĞĮĻJÃ_ÑĪJ - Downloader
 * ======================================================
 *  YouTube audio / vidéo
 *  (TikTok & Instagram extensibles)
 */

const ytdl = require("ytdl-core");

module.exports = async (sock, m, args, logger) => {
  try {
    if (!args[0]) {
      return sock.sendMessage(m.key.remoteJid, {
        text:
          "❌ *Lien manquant*\n\n" +
          "Utilisation :\n" +
          "▶️ *.yta <lien YouTube>*\n" +
          "🎥 *.ytv <lien YouTube>*\n\n" +
          "🤖 *ÑĞĮĻJÃ_ÑĪJ*"
      });
    }

    const url = args[0];

    if (!ytdl.validateURL(url)) {
      return sock.sendMessage(m.key.remoteJid, {
        text: "❌ Lien YouTube invalide."
      });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    // AUDIO
    if (m.body.startsWith(".yta")) {
      logger.info(`🎵 Téléchargement audio : ${title}`);

      const audio = ytdl(url, { filter: "audioonly" });

      await sock.sendMessage(m.key.remoteJid, {
        audio: { stream: audio },
        mimetype: "audio/mp4",
        fileName: `${title}.mp3`
      });
    }

    // VIDEO
    if (m.body.startsWith(".ytv")) {
      logger.info(`🎥 Téléchargement vidéo : ${title}`);

      const video = ytdl(url, { quality: "18" });

      await sock.sendMessage(m.key.remoteJid, {
        video: { stream: video },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: "🎥 *ÑĞĮĻJÃ_ÑĪJ Downloader*"
      });
    }

  } catch (err) {
    logger.error("❌ Erreur Downloader :", err);

    await sock.sendMessage(m.key.remoteJid, {
      text: "❌ Erreur lors du téléchargement."
    });
  }
};