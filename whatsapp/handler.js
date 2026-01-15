/**
 * Traitement des commandes WhatsApp
 * Putain de menu et tout le bordel
 */

const config = require('../../config/settings.json');
const { downloadYouTube, downloadTikTok, downloadInstagram } = require('../features/downloader');
const { processAI } = require('../features/ai');

async function handleMessage(sock, msg) {
    const text = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || '';
    const sender = msg.key.remoteJid;
    const isGroup = sender.includes('@g.us');
    
    // Commandes owner
    const ownerCommands = ['!mode', '!broadcast', '!eval'];
    const isOwner = sender === config.OWNER_NUMBER;
    
    // Menu
    if (text === '!menu') {
        const menu = `
*🧰 MENU ÑĞĮĻJÃ_ÑĪJ*

*Téléchargement:*
• !yt <url> - YouTube vidéo
• !ytmp3 <url> - YouTube audio
• !tt <url> - TikTok
• !ig <url> - Instagram

*IA:*
• !ai <question> - Chat IA
• !img <prompt> - Générer image

*Owner:*
• !mode <public/private>
• !bc <message>

*Autres:*
• !ping - Vérifier bot
• !info - Infos bot
        `;
        await sock.sendMessage(sender, { text: menu });
    }
    
    // YouTube download
    if (text.startsWith('!yt ')) {
        const url = text.split(' ')[1];
        await sock.sendMessage(sender, { text: 'Téléchargement YouTube en cours, merde...' });
        const video = await downloadYouTube(url);
        await sock.sendMessage(sender, { 
            video: { url: video.path },
            caption: 'Voilà ta putain de vidéo YouTube!'
        });
    }
    
    // IA
    if (text.startsWith('!ai ')) {
        const question = text.replace('!ai ', '');
        const response = await processAI(question);
        await sock.sendMessage(sender, { text: response });
    }
    
    // Ping
    if (text === '!ping') {
        await sock.sendMessage(sender, { text: 'PONG! Bot actif, bordel!' });
    }
}

module.exports = { handleMessage };