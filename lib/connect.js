/**
 * ÑĞĮĻJÃ_ÑĪJ - Connexion WhatsApp Multi-Device
 * Fichier : lib/connect.js
 * 
 * Ce fichier gère :
 * - La connexion WhatsApp via @adiwajshing/baileys
 * - La session persistante (auth_info.json)
 * - La génération du code à 8 caractères pour le pairing
 * - Les événements principaux du bot
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs-extra');
const path = require('path');

// Création du dossier sessions si n'existe pas
const SESSIONS_PATH = path.resolve('./sessions');
fs.ensureDirSync(SESSIONS_PATH);

// Auth persistante
const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_PATH);

// Fonction principale pour connecter le bot
async function startBot() {
    const client = makeWASocket({
        auth: state,
        logger: P({ level: 'info' }),
        printQRInTerminal: false, // Pas de QR code
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr, paired } = update;

        if (qr) {
            console.log('🔹 Code Pairing WhatsApp généré :', qr);
            console.log('Ce code à 8 caractères doit être utilisé pour lier un compte Telegram.');
        }

        if (connection === 'close') {
            const reason = (lastDisconnect?.error)?.output?.statusCode;
            console.log('⚠️ Déconnexion du bot, raison :', reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Tentative de reconnexion...');
                startBot();
            } else {
                console.log('❌ Déconnecté définitivement, reconnectez manuellement.');
            }
        }

        if (connection === 'open') {
            console.log('✅ WhatsApp session ready ! - ÑĞĮĻJÃ_ÑĪJ');
        }
    });

    // Gestion des messages entrants
    client.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message) return;

        // Exemple simple : répondre "Bonjour" si message texte reçu
        const text = message.message.conversation;
        if (text && text.toLowerCase() === 'bonjour') {
            await client.sendMessage(message.key.remoteJid, { text: 'Salut ! Je suis ÑĞĮĻJÃ_ÑĪJ 🤖' });
        }
    });

    return client;
}

// Export pour l'utiliser dans index.js ou plugins
module.exports = { startBot };