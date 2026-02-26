// ============================================
// FICHIER: server.js
// BOT: NGILJA BOT
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
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

const config = require('./config'); // fichier config.js avec bot info, commandes, settings

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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ============================================
// STATUS API
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
// PARRAINAGE API
// ============================================
app.post('/api/pair', (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ success: false, error: 'Numéro requis' });

    let number = phoneNumber.replace(/\D/g, '');
    if (!number.startsWith('243')) number = '243' + number.replace(/^0+/, '');

    if (!sock || !connected) return res.status(400).json({ success: false, error: 'Bot non connecté' });

    // Générer un code aléatoire de 8 caractères
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    // Stocker le code dans un fichier JSON pour référence
    const codesFile = './ref_codes.json';
    let codes = fs.existsSync(codesFile) ? JSON.parse(fs.readFileSync(codesFile)) : {};
    codes[number] = { code, expiresAt: Date.now() + 60 * 1000 }; // valable 60 sec
    fs.writeFileSync(codesFile, JSON.stringify(codes, null, 2));

    console.log(`📱 Code de parrainage pour ${number}: ${code}`);
    res.json({ success: true, code, expiresIn: 60 });
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

        // --- COMMANDES DE BASE + PARRAINAGE ---
        let text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (!text) return;

        if (text.startsWith(config.bot.prefix)) {
            const args = text.slice(config.bot.prefix.length).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            // COMMANDES DE BASE
            if (cmd === 'ping') await sock.sendMessage(chatId, { text: '🏓 Pong!' });
            if (cmd === 'alive') await sock.sendMessage(chatId, { text: `${config.bot.name} est en ligne !` });
            if (cmd === 'help') await sock.sendMessage(chatId, { text: `📜 Commandes: .ping, .alive, .help, .pair` });

            // PARRAINAGE
            if (cmd === 'pair') {
                const number = args[0]?.replace(/\D/g, '');
                if (!number) return await sock.sendMessage(chatId, { text: '❌ Usage: .pair [numéro]' });

                const codesFile = './ref_codes.json';
                const codes = fs.existsSync(codesFile) ? JSON.parse(fs.readFileSync(codesFile)) : {};
                if (codes[number] && codes[number].expiresAt > Date.now()) {
                    await sock.sendMessage(chatId, { text: `✅ Code: ${codes[number].code} (valable 60s)` });
                } else {
                    await sock.sendMessage(chatId, { text: '❌ Code introuvable ou expiré' });
                }
            }
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