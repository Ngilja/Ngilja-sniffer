// ============================================
// FICHIER: server.js
// BOT: ELEXTERCORES FLEX
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// VERSION: 1.0.0
// ============================================

// ============================================
// 1. IMPORT DES MODULES
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
// 2. IMPORT DE LA CONFIGURATION
// ============================================
const config = require('./config');

// ============================================
// 3. INITIALISATION DE L'APPLICATION
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
// 4. CONFIGURATION EXPRESS
// ============================================
app.use(express.static('public'));
app.use(express.json());

// ============================================
// 5. ROUTE PRINCIPALE
// ============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// 6. ROUTES API
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

// Route pour obtenir la photo de profil
app.get('/api/profile-pic', (req, res) => {
    const profilePicPath = path.join(__dirname, config.paths.profilePic);
    if (fs.existsSync(profilePicPath)) {
        res.sendFile(profilePicPath);
    } else {
        res.status(404).json({ error: 'Photo de profil non trouvée' });
    }
});

// Route pour obtenir les commandes
app.get('/api/commands', (req, res) => {
    res.json({
        botName: config.bot.name,
        commands: config.commands,
        prefix: config.bot.prefix
    });
});

// ============================================
// 7. SOCKET.IO CONNEXION
// ============================================
io.on('connection', (socket) => {
    console.log(`🌐 Nouveau client connecté au dashboard`);
    
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
// 8. FONCTION PRINCIPALE DU BOT
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
        // 9. GESTION DES ÉVÉNEMENTS DE CONNEXION
        // ============================================
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            // QR CODE
            if (qr) {
                try {
                    const qrImage = await qrcode.toDataURL(qr);
                    io.emit('qr', qrImage);
                    console.log('📱 QR Code généré - Scannez avec WhatsApp');
                    console.log('⏳ En attente de scan...');
                    reconnectAttempts = 0;
                } catch (error) {
                    console.error('❌ Erreur génération QR:', error);
                }
            }

            // CONNEXION RÉUSSIE
            if (connection === 'open') {
                connected = true;
                reconnectAttempts = 0;
                
                console.log('✅ CONNEXION RÉUSSIE !');
                console.log(`📱 Numéro: ${sock.user?.id?.split(':')[0]}`);
                
                // Mettre à jour le profil
                await updateBotProfile();
                
                io.emit('connected', {
                    number: sock.user?.id?.split(':')[0],
                    name: config.bot.name,
                    owner: config.bot.owner,
                    version: config.bot.version
                });
                
                const sessionInfo = {
                    number: sock.user?.id?.split(':')[0],
                    name: config.bot.name,
                    owner: config.bot.owner,
                    connectedAt: new Date().toISOString()
                };
                fs.writeFileSync('session.json', JSON.stringify(sessionInfo, null, 2));
            }

            // DÉCONNEXION
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

        // ============================================
        // 10. FONCTION DE MISE À JOUR DU PROFIL
        // ============================================
        async function updateBotProfile() {
            try {
                console.log('📸 Mise à jour du profil...');
                
                if (config.bot.name) {
                    await sock.updateProfileName(config.bot.name);
                    console.log('✅ Nom du bot mis à jour:', config.bot.name);
                }
                
                const profilePicPath = path.join(__dirname, config.paths.profilePic);
                if (fs.existsSync(profilePicPath)) {
                    const profilePic = fs.readFileSync(profilePicPath);
                    await sock.updateProfilePicture(sock.user.id, profilePic);
                    console.log('✅ Photo de profil mise à jour');
                } else {
                    console.log('⚠️ Photo de profil non trouvée dans:', profilePicPath);
                }
                
                const status = `${config.bot.emoji} Bot de ${config.bot.owner} | v${config.bot.version}`;
                await sock.updateProfileStatus(status);
                console.log('✅ Status mis à jour:', status);
                
            } catch (error) {
                console.error('❌ Erreur mise à jour profil:', error);
            }
        }

        // ============================================
        // 11. GESTION DES MESSAGES ENTRANTS
        // ============================================
        sock.ev.on('messages.upsert', async (messageUpdate) => {
            const message = messageUpdate.messages[0];
            
            if (message.key.fromMe) return;
            if (!message.message) return;
            
            try {
                let text = '';
                if (message.message.conversation) {
                    text = message.message.conversation;
                } else if (message.message.extendedTextMessage?.text) {
                    text = message.message.extendedTextMessage.text;
                } else if (message.message.imageMessage?.caption) {
                    text = message.message.imageMessage.caption;
                } else if (message.message.videoMessage?.caption) {
                    text = message.message.videoMessage.caption;
                }
                
                const sender = message.key.participant || message.key.remoteJid;
                const isGroup = message.key.remoteJid.endsWith('@g.us');
                const chatId = message.key.remoteJid;
                
                const logMessage = {
                    from: isGroup ? `Groupe: ${chatId.split('@')[0]}` : `Individuel: ${chatId.split('@')[0]}`,
                    text: text || '[Média sans texte]',
                    time: new Date().toLocaleTimeString('fr-FR'),
                    sender: sender?.split('@')[0] || 'Inconnu',
                    type: isGroup ? 'group' : 'private'
                };
                
                console.log(`📨 Message de ${logMessage.from}: ${text || 'Média'}`);
                io.emit('newMessage', logMessage);
                
                // TRAITEMENT DES COMMANDES
                if (text && text.startsWith(config.bot.prefix)) {
                    await handleCommand(sock, message, text, isGroup, chatId);
                }
                
            } catch (error) {
                console.error('❌ Erreur traitement message:', error);
            }
        });

        // ============================================
        // 12. GESTION DES MISES À JOUR DE GROUPE
        // ============================================
        sock.ev.on('group-participants.update', async (update) => {
            const { id, participants, action } = update;
            console.log(`👥 Groupe ${id}: ${action} pour ${participants.length} participant(s)`);
            
            io.emit('groupUpdate', {
                groupId: id,
                action: action,
                participants: participants,
                time: new Date().toLocaleTimeString('fr-FR')
            });
        });

        // ============================================
        // 13. FONCTION DE GESTION DES COMMANDES
        // ============================================
        async function handleCommand(sock, message, text, isGroup, chatId) {
            const args = text.slice(config.bot.prefix.length).split(' ');
            const commandName = args[0].toLowerCase();
            const commandArgs = args.slice(1);
            
            console.log(`🎯 Commande reçue: ${config.bot.prefix}${commandName}`);
            
            const commandConfig = config.getCommand(commandName);
            
            if (!commandConfig) {
                await sock.sendMessage(chatId, {
                    text: config.formatMessage('notFound', { cmd: commandName })
                });
                return;
            }
            
            try {
                await executeCommand(commandName, commandArgs, message, chatId, isGroup);
                
                io.emit('commandExecuted', {
                    command: commandName,
                    args: commandArgs,
                    from: chatId,
                    status: 'success',
                    time: new Date().toLocaleTimeString('fr-FR')
                });
                
            } catch (error) {
                console.error(`❌ Erreur commande ${commandName}:`, error);
                
                await sock.sendMessage(chatId, {
                    text: config.formatMessage('error', { error: error.message })
                });
                
                io.emit('commandExecuted', {
                    command: commandName,
                    error: error.message,
                    status: 'error',
                    time: new Date().toLocaleTimeString('fr-FR')
                });
            }
        }

        // ============================================
        // 14. EXÉCUTION DES COMMANDES
        // ============================================
        async function executeCommand(command, args, message, chatId, isGroup) {
            const jid = chatId;
            const sender = message.key.participant || message.key.remoteJid;
            
            // Dictionnaire des commandes
            const commands = {
                // ========================================
                // COMMANDES DE BASE
                // ========================================
                'ping': async () => {
                    const start = Date.now();
                    await sock.sendMessage(jid, { text: '🏓 Pong!' });
                    const end = Date.now();
                    await sock.sendMessage(jid, { 
                        text: `⚡ Latence: ${end - start}ms` 
                    });
                },

                'alive': async () => {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    
                    await sock.sendMessage(jid, { 
                        text: config.formatMessage('alive', {
                            uptime: `${hours}h ${minutes}m`,
                            ram: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
                        })
                    });
                },

                'system': async () => {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const seconds = Math.floor(uptime % 60);
                    
                    await sock.sendMessage(jid, { 
                        text: `📊 *SYSTÈME - ${config.bot.name}*

👤 *Propriétaire:* ${config.bot.owner}
🖥️ *Platforme:* ${process.platform}
📦 *Node.js:* ${process.version}
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *RAM:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
🌐 *Session:* ${connected ? '✅ Active' : '❌ Inactive'}

_${new Date().toLocaleString('fr-FR')}_`
                    });
                },

                'sessions': async () => {
                    const sessions = fs.existsSync('auth_info') ? 
                        fs.readdirSync('auth_info').filter(f => f.endsWith('.json')).length : 0;
                    
                    let sessionInfo = { number: 'Inconnu', name: 'Inconnu' };
                    if (fs.existsSync('session.json')) {
                        try {
                            sessionInfo = JSON.parse(fs.readFileSync('session.json', 'utf8'));
                        } catch (e) {}
                    }
                    
                    await sock.sendMessage(jid, { 
                        text: `📱 *SESSIONS - ${config.bot.name}*

━━━━━━━━━━━━━━
👤 *Propriétaire:* ${config.bot.owner}
📊 *Statut:* ${connected ? '✅ Connecté' : '❌ Déconnecté'}
🔢 *Numéro:* ${sessionInfo.number}
📁 *Fichiers:* ${sessions}
⏰ *Connecté le:* ${sessionInfo.connectedAt ? new Date(sessionInfo.connectedAt).toLocaleString('fr-FR') : 'Jamais'}

━━━━━━━━━━━━━━
💡 *Commandes:* .ping, .alive, .system, .help`
                    });
                },

                'help': async () => {
                    let helpText = `╭━━━━━━━━━━━━━━╮
┃ 🤖 *${config.bot.name}* ┃
╰━━━━━━━━━━━━━━╯

👤 *Propriétaire:* ${config.bot.owner}
⚡ *Version:* ${config.bot.version}

━━━━━━━━━━━━━━
*📋 COMMANDES DISPONIBLES*
━━━━━━━━━━━━━━\n\n`;
                    
                    // Grouper par catégorie
                    const categories = {};
                    Object.keys(config.commands).forEach(cmd => {
                        const cat = config.commands[cmd].category || 'general';
                        if (!categories[cat]) categories[cat] = [];
                        categories[cat].push(cmd);
                    });
                    
                    for (let [cat, cmds] of Object.entries(categories)) {
                        helpText += `*${cat.toUpperCase()}*\n`;
                        cmds.forEach(cmd => {
                            helpText += `  ${config.bot.prefix}${cmd} - ${config.commands[cmd].description}\n`;
                        });
                        helpText += '\n';
                    }
                    
                    helpText += `━━━━━━━━━━━━━━\n_Pour plus d'aide: ${config.bot.prefix}help [commande]_`;
                    
                    await sock.sendMessage(jid, { text: helpText });
                },

                // ========================================
                // COMMANDES DE GROUPE
                // ========================================
                'join': async () => {
                    if (!isGroup) {
                        await sock.sendMessage(jid, { 
                            text: '❌ Cette commande ne peut être utilisée que dans un groupe' 
                        });
                        return;
                    }
                    
                    if (args[0]) {
                        try {
                            await sock.groupAcceptInvite(args[0]);
                            await sock.sendMessage(jid, { 
                                text: '✅ Groupe rejoint avec succès!' 
                            });
                        } catch (e) {
                            await sock.sendMessage(jid, { 
                                text: '❌ Impossible de rejoindre le groupe. Vérifiez le lien.' 
                            });
                        }
                    } else {
                        await sock.sendMessage(jid, { 
                            text: '❌ Utilisation: .join [lien du groupe]' 
                        });
                    }
                },

                'leave': async () => {
                    if (!isGroup) {
                        await sock.sendMessage(jid, { 
                            text: '❌ Cette commande ne peut être utilisée que dans un groupe' 
                        });
                        return;
                    }
                    
                    await sock.sendMessage(jid, { 
                        text: '👋 Au revoir ! Je quitte le groupe...' 
                    });
                    setTimeout(async () => {
                        await sock.groupLeave(jid);
                    }, 2000);
                },

                // ========================================
                // COMMANDES MÉDIA
                // ========================================
                'getdp': async () => {
                    let target = args[0] || sender;
                    target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    
                    try {
                        const ppUrl = await sock.profilePictureUrl(target, 'image');
                        await sock.sendMessage(jid, { 
                            image: { url: ppUrl },
                            caption: `📸 Photo de profil de @${target.split('@')[0]}`,
                            mentions: [target]
                        });
                    } catch {
                        await sock.sendMessage(jid, { 
                            text: '❌ Pas de photo de profil trouvée ou utilisateur inexistant' 
                        });
                    }
                },

                'play': async () => {
                    if (args.length === 0) {
                        await sock.sendMessage(jid, { 
                            text: '❌ Utilisation: .play [titre de la musique]' 
                        });
                        return;
                    }
                    
                    const query = args.join(' ');
                    await sock.sendMessage(jid, { 
                        text: `🎵 Recherche de: "${query}"...\n\n⚠️ Fonctionnalité en développement. Bientôt disponible !` 
                    });
                },

                'st': async () => {
                    await sock.sendMessage(jid, { 
                        text: `⚙️ *PARAMÈTRES - ${config.bot.name}*

📱 *Nom:* ${config.bot.name}
👤 *Propriétaire:* ${config.bot.owner}
🔧 *Préfixe:* ${config.bot.prefix}
🌐 *Langue:* ${config.settings.language}
⚡ *Anti-spam:* ${config.settings.antiSpam ? '✅ Activé' : '❌ Désactivé'}

_Paramètres modifiables via le dashboard web_` 
                    });
                },

                // ========================================
                // COMMANDES DE TEST
                // ========================================
                'test': async () => {
                    await sock.sendMessage(jid, { 
                        text: `✅ Bot fonctionnel !\n\n📱 ${config.bot.name}\n👤 ${config.bot.owner}` 
                    });
                }
            };

            // Exécuter la commande si elle existe
            if (commands[command]) {
                await commands[command]();
            } else {
                // Si la commande n'est pas dans la liste mais existe dans config
                await sock.sendMessage(jid, { 
                    text: `❌ Commande "${command}" non implémentée encore.` 
                });
            }
        }

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        console.log('🔄 Redémarrage dans 5 secondes...');
        setTimeout(startBot, 5000);
    }
}

// ============================================
// 15. DÉMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('╔════════════════════════════════════╗');
    console.log('║    SERVEUR WEB DÉMARRÉ            ║');
    console.log('╠════════════════════════════════════╣');
    console.log(`║  URL: http://localhost:${PORT}`);
    console.log(`║  Bot: ${config.bot.name}`);
    console.log(`║  Owner: ${config.bot.owner}`);
    console.log('╚════════════════════════════════════╝');
});

// Démarrer le bot
startBot();

// ============================================
// 16. GESTION DES ERREURS NON CAPTURÉES
// ============================================
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promesse rejetée non gérée:', error);
});

// Export pour les tests
module.exports = { app, server, io };// ============================================
// ROUTE POUR LE CODE DE PARRAGE
// ============================================
app.post('/api/pair', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }
    
    try {
        // Nettoyer le numéro
        let number = phoneNumber.replace(/[^0-9]/g, '');
        
        console.log(`📱 Demande de code pour: ${number}`);
        
        // Générer le code de pairage
        if (!sock) {
            return res.status(400).json({ error: 'Bot pas initialisé' });
        }
        
        // Demander le code
        const code = await sock.requestPairingCode(number);
        
        // Formater le code (XXXX-XXXX)
        const formattedCode = code.match(/.{1,4}/g).join('-');
        
        res.json({ 
            success: true, 
            code: formattedCode,
            message: 'Code généré avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur pairage:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la génération du code',
            details: error.message 
        });
    }
});