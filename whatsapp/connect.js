/**
 * ÑĞĮĻJÃ_ÑĪJ - Connexion WhatsApp MD
 * Fichier : whatsapp/connect.js
 *
 * Gère :
 * - Connexion WhatsApp Multi-Device
 * - Session persistante (auth_info.json)
 * - Pairing par code à 8 caractères
 * - Gestion des événements (messages, appels)
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const { handleMessage } = require('../lib/handler');

// Créer le dossier de session si inexistant
const sessionFolder = path.resolve('./sessions');
if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

async function startWhatsApp() {
    // Authentification multi-fichier (permet de garder session persistante)
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    // Version WhatsApp
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        logger: P({ level: 'info' }),
        printQRInTerminal: true, // Affiche QR si jamais pairing manuel
        auth: state,
        version
    });

    client.ev.on('creds.update', saveCreds);

    // Gestion des messages entrants
    client.ev.on('messages.upsert', async (msg) => {
        if (!msg.messages) return;
        for (const m of msg.messages) {
            await handleMessage(client, m);
        }
    });

    // Gestion des appels entrants
    client.ev.on('call', async (call) => {
        await client.sendMessage(call.id.remoteJid, { text: '❌ Les appels ne sont pas autorisés par ÑĞĮĻJÃ_ÑĪJ' });
    });

    // Gestion des déconnexions
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect.error?.output?.statusCode;
            console.log(`❌ Déconnecté, raison : ${reason}`);
            if (reason !== DisconnectReason.loggedOut) {
                startWhatsApp(); // Reconnexion automatique
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connecté ! - ÑĞĮĻJÃ_ÑĪJ');
        }
    });

    return client;
}

// Lancer le bot si ce fichier est exécuté directement
if (require.main === module) startWhatsApp();

module.exports = { startWhatsApp };