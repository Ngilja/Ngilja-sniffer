// ============================================
// FICHIER: bot.js
// BOT: Bandaheali-Mini
// PROPRIÉTAIRE: Bandaheali
// VERSION: 1.0.0
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
require('dotenv').config();

// ============================================
// IMPORT CONFIG
// ============================================
const config = require('./config');

// ============================================
// INITIALISATION
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let sock = null;
let connected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = config.advanced.maxReconnectAttempts;

// ============================================
// EXPRESS
// ============================================
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API status
app.get('/api/status', (req, res) => {
    res.json({
        connected,
        botName: config.bot.name,
        owner: config.bot.owner,
        version: config.bot.version,
        number: sock?.user?.id?.split(':')[0] || null,
        uptime: process.uptime(),
        color: config.colors.primary
    });
});

// API send message
app.post('/api/send-message', async (req, res) => {
    const { to, message } = req.body;
    if (!sock || !connected) return res.status(400).json({ error: 'Bot non connecté' });
    try {
        const jid = to.includes('@') ? to : to + '@s.whatsapp.net';
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true, message: 'Message envoyé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API logout
app.post('/api/logout', async (req, res) => {
    if (sock) {
        try {
            await sock.logout();
            connected = false;
            res.json({ success: true, message: 'Bot déconnecté' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else res.status(400).json({ error: 'Bot non connecté' });
});

// ============================================
// SOCKET.IO DASHBOARD
// ============================================
io.on('connection', (socket) => {
    console.log('🌐 Client connecté au dashboard');
    socket.emit('status', { connected, botName: config.bot.name, owner: config.bot.owner });
    socket.on('disconnect', () => console.log('👋 Client déconnecté du dashboard'));
});

// ============================================
// FONCTION BOT PRINCIPALE
// ============================================
async function startBot() {
    try {
        console.log('╔═════════════ DÉMARRAGE DU BOT ════════════╗');
        console.log(`║ Bot: ${config.bot.name} | Owner: ${config.bot.owner} ║`);
        console.log('╚═══════════════════════════════════════════╝');

        const { state, saveCreds } = await useMultiFileAuthState('auth_info');

        sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
            logger: pino({ level: 'debug' }),
            browser: ['Bandaheali-Mini', 'Chrome', '1.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: true
        });

        // ============================================
        // GESTION QR CODE
        // ============================================
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                const qrDataUrl = await qrcode.toDataURL(qr);
                io.emit('qr', qrDataUrl);
                qrcode.toString(qr, { type: 'terminal', small: true }, (_, url) => console.log(url));
            }

            if (connection === 'open') {
                connected = true;
                reconnectAttempts = 0;
                console.log('✅ Bot connecté:', sock.user?.id?.split(':')[0]);
                io.emit('connected', { number: sock.user?.id?.split(':')[0] });
            }

            if (connection === 'close') {
                connected = false;
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`🔄 Reconnexion ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
                    setTimeout(startBot, config.advanced.reconnectInterval);
                } else {
                    console.log('🛑 Arrêt reconnection');
                    io.emit('disconnected', { permanent: true });
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // ============================================
        // AUTOREAD / AUTOREACT / AUTORECORD
        // ============================================
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg?.message || msg.key.fromMe) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const chatId = msg.key.remoteJid;

            // autoread
            if (config.settings.autoread) await sock.sendReadReceipt(chatId, msg.key.participant || chatId, [msg.key.id]);

            // autoreact
            if (config.settings.autoreact) {
                await sock.sendMessage(chatId, { react: { text: '👍', key: msg.key } });
            }

            // autorecord
            if (config.settings.autorecord) {
                console.log(`🎙️ Message reçu: ${text}`);
            }

            // commandes
            if (text.startsWith(config.bot.prefix)) handleCommand(sock, msg, text, chatId);
        });

    } catch (error) {
        console.error('❌ Erreur bot:', error);
        setTimeout(startBot, 5000);
    }
}

// ============================================
// GESTION DES COMMANDES
// ============================================
async function handleCommand(sock, msg, text, chatId) {
    const args = text.slice(config.bot.prefix.length).split(' ');
    const cmd = args.shift().toLowerCase();

    const commandConfig = config.getCommand(cmd);
    if (!commandConfig) return;

    try {
        // Ici tu peux exécuter toutes les commandes comme .pair, .ping, .alive etc.
        if (cmd === 'pair') {
            await sock.sendMessage(chatId, { text: '📲 Fonction parrainage activée. (À configurer)' });
        } else {
            await sock.sendMessage(chatId, { text: `✅ Commande "${cmd}" reçue` });
        }
    } catch (error) {
        console.error('❌ Erreur commande:', error);
    }
}

// ============================================
// DÉMARRAGE SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`));

// Lancer le bot
startBot();