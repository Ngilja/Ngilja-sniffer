/**
 * Connexion WhatsApp Multi-Device
 * Putain de pairing code au lieu du QR
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

// Stocker la session
let sock = null;

async function initWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp_session');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: { level: 'silent' }
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(chalk.yellow('PUTAIN! QR reçu, mais on veut pairing code!'));
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('Connexion fermée, reconnexion...'), shouldReconnect);
            if (shouldReconnect) {
                initWhatsApp();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Bot WhatsApp connecté, bordel!'));
            
            // Enregistrer le numéro
            const user = sock.user;
            console.log(chalk.blue(`Connecté en tant que: ${user.id}`));
        }
    });
    
    // Charger les handlers
    require('./events')(sock);
    
    return sock;
}

// Fonction pour générer pairing code
async function generatePairingCode(phoneNumber) {
    if (!sock) throw new Error('Socket pas initialisé, merde!');
    
    try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(chalk.green(`Code de pairing: ${code}`));
        return code;
    } catch (err) {
        console.log(chalk.red('Erreur pairing:'), err);
        throw err;
    }
}

module.exports = { initWhatsApp, generatePairingCode };