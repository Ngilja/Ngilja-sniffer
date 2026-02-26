// ============================================
// FICHIER: server.js
// BOT: NGILJA BOT
// VERSION: 1.0.0
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const config = require('./config'); // ton fichier config.js avec préfixe, owner, commandes etc.

// ============================================
// INITIALISATION DU SERVEUR
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let sock = null;
let connected = false;

// ============================================
// EXPRESS
// ============================================
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// ROUTE STATUS
// ============================================
app.get('/api/status', (req, res) => {
    res.json({
        connected,
        botName: config.bot.name,
        owner: config.bot.owner,
        number: sock?.user?.id?.split(':')[0] || null,
        uptime: process.uptime()
    });
});

// ============================================
// SOCKET.IO
// ============================================
io.on('connection', (socket) => {
    console.log('🌐 Dashboard connecté');
    socket.emit('status', { connected, botName: config.bot.name, owner: config.bot.owner });
});

// ============================================
// FONCTION PRINCIPALE DU BOT
// ============================================
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['NGILJA BOT', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    // ============================================
    // CONNECTION UPDATE
    // ============================================
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const qrImage = await qrcode.toDataURL(qr);
            io.emit('qr', qrImage);
            console.log('📱 QR code généré');
        }

        if (connection === 'open') {
            connected = true;
            console.log(`✅ Connecté ! Numéro: ${sock.user?.id?.split(':')[0]}`);
        }

        if (connection === 'close') {
            connected = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });

    // ============================================
    // MESSAGE HANDLER + AUTO FEATURES
    // ============================================
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message || message.key.fromMe) return;
        const chatId = message.key.remoteJid;

        // --- AUTOREAD ---
        if (config.settings.autoread) await sock.readMessages([message.key]);

        // --- AUTOREACT ---
        if (config.settings.autoreact) {
            try { await sock.sendMessage(chatId, { react: { text: '✨', key: message.key } }); } 
            catch (e) { console.error('❌ Erreur autoreact', e); }
        }

        // --- AUTORECORD ---
        if (config.settings.autorecord && message.message.audioMessage) {
            const buffer = await sock.downloadMediaMessage(message);
            const filename = `audios/${Date.now()}_${chatId.split('@')[0]}.ogg`;
            fs.writeFileSync(filename, buffer);
            console.log(`🎙️ Audio enregistré: ${filename}`);
        }

        // --- COMMANDES DE BASE ---
        let text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (text && text.startsWith(config.bot.prefix)) {
            const args = text.slice(config.bot.prefix.length).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            if (cmd === 'ping') await sock.sendMessage(chatId, { text: '🏓 Pong!' });
            if (cmd === 'alive') await sock.sendMessage(chatId, { text: `${config.bot.name} est en ligne !` });
            if (cmd === 'help') await sock.sendMessage(chatId, { text: `📜 Commandes: .ping, .alive, .help` });
        }
    });
}

// ============================================
// DEMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));

// Démarrer le bot
startBot();