/**
 * ÑĞĮĻJÃ_ÑĪJ - Gestion des messages et commandes WhatsApp
 * Fichier : whatsapp/handler.js
 *
 * Fonctionnalités :
 * - Commandes owner
 * - Mode public / privé
 * - Réponses automatiques
 * - Téléchargement YouTube, TikTok, Instagram
 * - Intégration des features antiviewonce, antidelete, antical
 */

const fs = require('fs');
const path = require('path');
const { handleEvent } = require('./events');
const downloader = require('../features/downloader');
const ai = require('../features/ai');

const ownerNumber = '243990774206@s.whatsapp.net'; // Numéro owner

/**
 * Fonction principale pour gérer les messages entrants
 * @param {import('@adiwajshing/baileys').AnyWASocket} client
 * @param {Object} msg
 */
async function handleMessage(client, msg) {
    try {
        const messageType = Object.keys(msg.message || {})[0];
        const jid = msg.key.remoteJid;
        const isOwner = msg.key.participant === ownerNumber || jid === ownerNumber;

        // Appeler les events (Anti-delete, Anti-viewonce)
        await handleEvent(client, { update: msg });

        // Messages texte simples
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const text = messageType === 'conversation'
                ? msg.message.conversation
                : msg.message.extendedTextMessage.text;

            // Commandes owner
            if (text.startsWith('!')) {
                if (!isOwner) return; // Seulement le owner peut utiliser ces commandes

                if (text === '!mode public') {
                    global.botMode = 'public';
                    await client.sendMessage(jid, { text: '✅ Mode public activé !' });
                }
                if (text === '!mode privé') {
                    global.botMode = 'private';
                    await client.sendMessage(jid, { text: '✅ Mode privé activé !' });
                }
                if (text.startsWith('!ai ')) {
                    const prompt = text.replace('!ai ', '');
                    const reply = await ai.generate(prompt); // Appel à l'IA
                    await client.sendMessage(jid, { text: reply });
                }
            }

            // Commandes publiques
            if (global.botMode === 'public' || isOwner) {
                if (text.startsWith('/yt ')) {
                    const query = text.replace('/yt ', '');
                    const url = await downloader.youtubeAudio(query);
                    await client.sendMessage(jid, { text: `🎵 Voici le lien audio : ${url}` });
                }
                if (text.startsWith('/tt ')) {
                    const query = text.replace('/tt ', '');
                    const url = await downloader.tiktok(query);
                    await client.sendMessage(jid, { text: `🎬 Voici le lien TikTok : ${url}` });
                }
                if (text.startsWith('/ig ')) {
                    const query = text.replace('/ig ', '');
                    const url = await downloader.instagram(query);
                    await client.sendMessage(jid, { text: `📸 Voici le lien Instagram : ${url}` });
                }
            }

            // Réponses automatiques
            if (text.toLowerCase().includes('bonjour')) {
                await client.sendMessage(jid, { text: '👋 Bonjour ! Je suis ÑĞĮĻJÃ_ÑĪJ' });
            }
        }

    } catch (error) {
        console.log('❌ Erreur dans handler.js :', error);
    }
}

module.exports = { handleMessage };