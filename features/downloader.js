/**
 * ÑĞĮĻJÃ_ÑĪJ - Downloader
 * Fichier : features/downloader.js
 *
 * Fonctionnalités :
 * - Télécharger YouTube (audio/vidéo)
 * - Télécharger TikTok et Instagram
 * - Compatible avec WhatsApp bot
 */

const axios = require('axios');
const fs = require('fs-extra');
const ytdl = require('ytdl-core'); // YouTube
const path = require('path');

// Télécharger une vidéo ou audio YouTube
async function downloadYouTube(url, type = 'video') {
    try {
        if (!ytdl.validateURL(url)) throw new Error('URL YouTube invalide.');

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, '-'); // Nettoyer le nom de fichier
        const filePath = path.resolve(__dirname, `../downloads/${title}.${type === 'audio' ? 'mp3' : 'mp4'}`);

        await fs.ensureDir(path.dirname(filePath));

        if (type === 'audio') {
            // Télécharger uniquement l'audio
            ytdl(url, { filter: 'audioonly' }).pipe(fs.createWriteStream(filePath));
        } else {
            // Télécharger la vidéo complète
            ytdl(url).pipe(fs.createWriteStream(filePath));
        }

        return filePath;
    } catch (error) {
        console.error('Erreur Downloader YouTube :', error.message);
        return null;
    }
}

// Télécharger TikTok ou Instagram via API publique (ou wrapper)
async function downloadSocial(url) {
    try {
        const apiUrl = `https://api.vevioz.com/tiktok?url=${encodeURIComponent(url)}`; // Exemple API TikTok
        const response = await axios.get(apiUrl);
        return response.data; // Retourner l'objet contenant les liens vidéo/audio
    } catch (error) {
        console.error('Erreur Downloader Social :', error.message);
        return null;
    }
}

module.exports = {
    downloadYouTube,
    downloadSocial
};