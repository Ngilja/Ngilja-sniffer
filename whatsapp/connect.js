/**
 * Module de connexion WhatsApp
 * Support QR code + Pairing code
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Variable globale pour le pairing code
let currentPairingCode = null;

async function startWhatsApp(config) {
  console.log(chalk.blue('📱 Initialisation WhatsApp...'));
  
  const sessionPath = path.join(config.PATHS.sessions, 'whatsapp');
  
  try {
    // État d'authentification
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    // Créer la socket
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // On gère nous-mêmes
      browser: config.WHATSAPP.BROWSER,
      markOnlineOnConnect: false,
      logger: require('pino')({ level: 'silent' })
    });
    
    // Sauvegarder les credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Gestion des événements de connexion
    sock.ev.on('connection.update', (update) => {
      handleConnectionUpdate(update, sock, config);
    });
    
    // Gestion des messages
    setupMessageHandlers(sock, config);
    
    return sock;
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur connexion WhatsApp:'), error.message);
    throw error;
  }
}

function handleConnectionUpdate(update, sock, config) {
  const { connection, lastDisconnect, qr, pairingCode } = update;
  
  // QR Code
  if (qr) {
    console.log(chalk.yellow('\n══════════════════════════════════════'));
    console.log(chalk.yellow('📱 SCANNEZ CE QR CODE AVEC WHATSAPP'));
    console.log(chalk.yellow('══════════════════════════════════════'));
    qrcode.generate(qr, { small: true });
    console.log(chalk.yellow('══════════════════════════════════════'));
    console.log(chalk.cyan('WhatsApp → ⋮ → Appareils liés → Associer un appareil'));
    console.log(chalk.yellow('══════════════════════════════════════\n'));
  }
  
  // Pairing Code (8 caractères)
  if (pairingCode) {
    currentPairingCode = pairingCode;
    console.log(chalk.green('\n══════════════════════════════════════'));
    console.log(chalk.green('📱 CODE DE PAIRING À 8 CARACTÈRES'));
    console.log(chalk.green('══════════════════════════════════════'));
    console.log(chalk.white.bold(`           ${pairingCode}           `));
    console.log(chalk.green('══════════════════════════════════════'));
    console.log(chalk.cyan('WhatsApp → ⋮ → Appareils liés → Associer un appareil'));
    console.log(chalk.cyan('Entrez ce code à 8 chiffres'));
    console.log(chalk.green('══════════════════════════════════════\n'));
  }
  
  // Connexion établie
  if (connection === 'open') {
    console.log(chalk.green('✅ CONNECTÉ À WHATSAPP !'));
    console.log(chalk.cyan(`👤 Utilisateur: ${sock.user?.name || 'Inconnu'}`));
    console.log(chalk.cyan(`📞 Numéro: ${sock.user?.id?.split(':')[0] || 'Inconnu'}`));
    
    // Envoyer notification au owner
    sendWelcomeMessage(sock, config);
  }
  
  // Déconnexion
  if (connection === 'close') {
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    
    if (shouldReconnect) {
      console.log(chalk.yellow('🔄 Déconnecté, reconnexion dans 5 secondes...'));
      setTimeout(() => startWhatsApp(config), 5000);
    } else {
      console.log(chalk.red('❌ Déconnecté définitivement.'));
      console.log(chalk.yellow('🔑 Supprimez le dossier sessions/ et redémarrez.'));
    }
  }
}

async function sendWelcomeMessage(sock, config) {
  const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
  
  try {
    await sock.sendMessage(ownerJid, {
      text: `✅ *${config.BOT_NAME} est en ligne !*\n\n` +
            `🤖 *Informations:*\n` +
            `• Version: ${config.VERSION}\n` +
            `• GitHub: ${config.URLS.REPOSITORY}\n` +
            `• Node.js: ${process.version}\n\n` +
            `📋 *Commandes:*\n` +
            `Tapez "menu" pour voir toutes les commandes\n\n` +
            `🔧 *Fonctionnalités:*\n` +
            Object.entries(config.FEATURES)
              .filter(([_, value]) => value)
              .map(([key]) => `• ${key}`)
              .join('\n')
    });
    
    console.log(chalk.green('📨 Message de bienvenue envoyé au owner.'));
  } catch (error) {
    console.error(chalk.red('❌ Erreur envoi message:'), error.message);
  }
}

function setupMessageHandlers(sock, config) {
  // Simple handler pour commencer
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    
    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || 
                msg.message.extendedTextMessage?.text || '';
    
    // Journalisation
    console.log(chalk.blue(`📨 ${sender.split('@')[0]}: ${text.substring(0, 50)}...`));
    
    // Traitement basique
    if (text.toLowerCase() === 'menu') {
      await sock.sendMessage(sender, {
        text: `📋 *MENU ${config.BOT_NAME}*\n\n` +
              `🔹 *Basique:*\n` +
              `• menu - Afficher ce menu\n` +
              `• ping - Tester le bot\n` +
              `• owner - Infos propriétaire\n` +
              `• code - Voir pairing code\n` +
              `• github - Lien du projet\n\n` +
              `🔹 *État:*\n` +
              `• Bot: ${config.BOT_NAME}\n` +
              `• Version: ${config.VERSION}\n` +
              `• Owner: ${config.OWNER_NUMBER}\n` +
              `• GitHub: ${config.URLS.REPOSITORY}`
      });
    }
    
    else if (text.toLowerCase() === 'ping') {
      await sock.sendMessage(sender, { text: '🏓 Pong! Bot actif.' });
    }
    
    else if (text.toLowerCase() === 'owner') {
      await sock.sendMessage(sender, {
        text: `👑 *PROPRIÉTAIRE*\n\n` +
              `📞 ${config.OWNER_NUMBER}\n` +
              `🤖 ${config.BOT_NAME}\n` +
              `⭐ ${config.URLS.REPOSITORY}`
      });
    }
    
    else if (text.toLowerCase() === 'code') {
      if (currentPairingCode) {
        await sock.sendMessage(sender, {
          text: `🔢 *CODE DE PAIRING:*\n` +
                `${currentPairingCode}\n\n` +
                `📱 WhatsApp → ⋮ → Appareils liés → Associer un appareil`
        });
      } else {
        await sock.sendMessage(sender, {
          text: '❌ Aucun code disponible. Le bot est déjà connecté.'
        });
      }
    }
    
    else if (text.toLowerCase() === 'github') {
      await sock.sendMessage(sender, {
        text: `🌐 *REPOSITORY GITHUB*\n\n` +
              `${config.URLS.REPOSITORY}\n\n` +
              `⭐ N'hésitez pas à mettre une star !\n` +
              `🐛 Signalez les bugs dans Issues`
      });
    }
  });
  
  console.log(chalk.green('✅ Handler de messages configuré.'));
}

module.exports = { startWhatsApp };