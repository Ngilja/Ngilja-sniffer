// ============================================
// FICHIER: server.js
// BOT: ELEXTERCORES FLEX
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// ============================================

// ============================================
// IMPORT DES MODULES
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
// IMPORT DE NOTRE CONFIGURATION
// ============================================
const config = require('./config');

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Variables globales
let sock = null;
let connected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = config.advanced.maxReconnectAttempts;

// ============================================
// CONFIGURATION EXPRESS
// ============================================
app.use(express.static('public'));
app.use(express.json());

// ============================================
// ROUTE PRINCIPALE
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// ROUTES API
// ============================================

// Route pour vérifier le statut
app.get('/api/status', (req, res) => {
    res.json({
        connected: connected,
        botName: config.bot.name,
        owner: config.bot.owner,
        version: config.bot.version,
        number: sock?.user?.id?.split(':')[0] || null,
        uptime: process.uptime(),
        color: config.colors.primary
    });
});

// Route pour envoyer un message
app.post('/api/send-message', async (req, res) => {
    const { to, message } = req.body;
    
    if (!sock || !connected) {
        return res.status(400).json({ 
            error: 'Bot non connecté',
            botName: config.bot.name
        });
    }

    try {
        let jid = to.includes('@') ? to : to + '@s.whatsapp.net';
        await sock.sendMessage(jid, { text: message });
        res.json({ 
            success: true,
            message: 'Message envoyé avec succès'
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            botName: config.bot.name
        });
    }
});

// Route pour déconnecter le bot
app.post('/api/logout', async (req, res) => {
    if (sock) {
        try {
            await sock.logout();
            connected = false;
            res.json({ 
                success: true,
                message: 'Bot déconnecté avec succès'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: 'Bot non connecté' });
    }
});

// Route pour obtenir la photo de profil du bot
app.get('/api/profile-pic', (req, res) => {
    const profilePicPath = path.join(__dirname, config.paths.profilePic);
    if (fs.existsSync(profilePicPath)) {
        res.sendFile(profilePicPath);
    } else {
        res.status(404).json({ error: 'Photo de profil non trouvée' });
    }
});

// Route pour obtenir la liste des commandes
app.get('/api/commands', (req, res) => {
    res.json({
        botName: config.bot.name,
        commands: config.commands,
        prefix: config.bot.prefix
    });
});

// ============================================
// SOCKET.IO CONNEXION
// ============================================
io.on('connection', (socket) => {
    console.log(`🌐 Nouveau client connecté au dashboard`);
    
    // Envoyer le statut actuel au nouveau client
    socket.emit('status', {
        connected: connected,
        botName: config.bot.name,
        owner: config.bot.owner
    });

    socket.on('disconnect', () => {
        console.log('👋 Client déconnecté du dashboard');
    });
});

// ============================================
// FONCTION PRINCIPALE DU BOT
// ============================================
async function startBot() {
    try {
        console.log('╔════════════════════════════════════╗');
        console.log('║    DÉMARRAGE DU BOT WHATSAPP      ║');
        console.log('╠════════════════════════════════════╣');
        console.log(`║  Bot: ${config.bot.name}`);
        console.log(`║  Propriétaire: ${config.bot.owner}`);
        console.log(`║  Version: ${config.bot.version}`);
        console.log('╚════════════════════════════════════╝');

        // Charger l'état d'authentification
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        // Créer la connexion WhatsApp
        sock = makeWASocket({
            printQRInTerminal: false,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: [config.bot.name, 'Chrome', config.bot.version],
            syncFullHistory: false,
            markOnlineOnConnect: true
        });

        // ============================================
        // GESTION DES ÉVÉNEMENTS DE CONNEXION
        // ============================================
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // ========================================
            // AFFICHAGE DU QR CODE
            // ========================================
            if (qr) {
                try {
                    const qrImage = await qrcode.toDataURL(qr);
                    io.emit('qr', qrImage);
                    console.log('📱 QR Code généré - Scannez avec WhatsApp');
                    console.log('⏳ En attente de scan...');
                    
                    // Réinitialiser les tentatives de reconnexion
                    reconnectAttempts = 0;
                } catch (error) {
                    console.error('❌ Erreur génération QR:', error);
                }
            }

            // ========================================
            // CONNEXION RÉUSSIE
            // ========================================
            if (connection === 'open') {
                connected = true;
                reconnectAttempts = 0;
                
                console.log('✅ CONNEXION RÉUSSIE !');
                console.log(`📱 Numéro: ${sock.user?.id?.split(':')[0]}`);
                
                // Changer la photo de profil et le nom
                await updateBotProfile();
                
                // Envoyer l'événement de connexion
                io.emit('connected', {
                    number: sock.user?.id?.split(':')[0],
                    name: config.bot.name,
                    owner: config.bot.owner,
                    version: config.bot.version
                });
                
                // Sauvegarder les infos de session
                const sessionInfo = {
                    number: sock.user?.id?.split(':')[0],
                    name: config.bot.name,
                    owner: config.bot.owner,
                    connectedAt: new Date().toISOString()
                };
                fs.writeFileSync('session.json', JSON.stringify(sessionInfo, null, 2));
            }

            // ========================================
            // DÉCONNEXION
            // ========================================
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                connected = false;
                
                console.log('❌ Connexion fermée');
                
                if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`🔄 Tentative de reconnexion ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
                    io.emit('reconnecting', { attempt: reconnectAttempts, max: MAX_RECONNECT_ATTEMPTS });
                    
                    setTimeout(startBot, config.advanced.reconnectInterval);
                } else {
                    console.log('🛑 Arrêt des tentatives de reconnexion');
                    io.emit('disconnected', { permanent: true });
                }
            }
        });

        // Sauvegarder les credentials
        sock.ev.on('creds.update', saveCreds);