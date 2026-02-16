// ============================================
// FICHIER: config.js
// BOT: ELEXTERCORES FLEX
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// ============================================

const config = {
    // ========================================
    // INFORMATIONS DU BOT (À VOTRE NOM)
    // ========================================
    bot: {
        name: 'ELEXTERCORES FLEX',           // Nom du bot
        owner: 'ÑĞĮĻJÃ_ÑĪJ',                   // Votre pseudo
        version: '1.0.0',                     // Version
        emoji: '⚡',                            // Emoji principal
        description: 'Bot WhatsApp multifonction créé avec ❤️',
        prefix: '.',                           // Préfixe des commandes
    },

    // ========================================
    // COULEURS DU BOT
    // ========================================
    colors: {
        primary: '#FF0000',     // Rouge (votre couleur)
        secondary: '#00FF00',   // Vert (votre couleur)
        warning: '#FFFF00',      // Jaune
        error: '#FF3333',        // Rouge clair
        success: '#00FF00',      // Vert
        info: '#0066FF'          // Bleu
    },

    // ========================================
    // PARAMÈTRES DU BOT
    // ========================================
    settings: {
        language: 'fr',                          // Langue par défaut
        timezone: 'Europe/Paris',                 // Fuseau horaire
        autoRead: false,                          // Lire automatiquement les messages
        autoTyping: false,                        // Simuler la frappe
        antiSpam: true,                           // Protection anti-spam
        maxSpam: 5,                                // Max messages avant anti-spam
        spamTime: 5000,                            // Temps anti-spam (ms)
        maxConnections: 1,                         // Max connexions simultanées
    },

    // ========================================
    // MESSAGES PERSONNALISÉS
    // ========================================
    messages: {
        welcome: `╭━━━━━━━━━━━━━━╮
┃ 🤖 *ELEXTERCORES BOT* ┃
╰━━━━━━━━━━━━━━╯

👋 Bienvenue sur le bot de {owner}

*📱 Commandes disponibles:*
.ping - Tester la connexion
.alive - Voir le statut
.system - Infos système
.sessions - Voir les sessions
.help - Liste complète

> Bot créé avec ❤️ par {owner}`,

        alive: `╭━━━━━━━━━━━━━━╮
┃ 🤖 *ELEXTERCORES BOT* ┃
╰━━━━━━━━━━━━━━╯

*✨ STATUT DU BOT*

📱 *Nom:* {name}
👤 *Propriétaire:* {owner}
⚡ *Version:* {version}
⏱️ *Uptime:* {uptime}
💾 *RAM:* {ram}MB
📊 *Statut:* ✅ En ligne

> Tapez .help pour plus de commandes`,

        error: '❌ *Erreur* : {error}',
        
        notFound: '❌ Commande "{cmd}" introuvable. Tapez .help pour voir les commandes disponibles',
        
        restricted: '❌ Vous n\'avez pas la permission d\'utiliser cette commande',
    },

    // ========================================
    // COMMANDES DISPONIBLES
    // ========================================
    commands: {
        // Commandes de base
        ping: {
            description: 'Tester la connexion du bot',
            usage: '.ping',
            category: 'general'
        },
        alive: {
            description: 'Afficher le statut du bot',
            usage: '.alive',
            category: 'general'
        },
        system: {
            description: 'Afficher les informations système',
            usage: '.system',
            category: 'general'
        },
        sessions: {
            description: 'Afficher les sessions actives',
            usage: '.sessions',
            category: 'general'
        },
        help: {
            description: 'Afficher l\'aide',
            usage: '.help [commande]',
            category: 'general'
        },

        // Commandes de groupe
        join: {
            description: 'Rejoindre un groupe avec un lien',
            usage: '.join [lien]',
            category: 'group'
        },
        leave: {
            description: 'Quitter un groupe',
            usage: '.leave',
            category: 'group'
        },

        // Commandes média
        getdp: {
            description: 'Récupérer la photo de profil',
            usage: '.getdp [numéro]',
            category: 'media'
        },
        play: {
            description: 'Jouer une musique',
            usage: '.play [titre]',
            category: 'media'
        }
    },

    // ========================================
    // CHEMINS DES FICHIERS
    // ========================================
    paths: {
        media: './media',                    // Dossier des médias
        auth: './auth_info',                  // Dossier d'authentification
        temp: './temp',                        // Dossier temporaire
        profilePic: './media/bot-profile.jpg', // Photo de profil
    },

    // ========================================
    // OPTIONS AVANCÉES
    // ========================================
    advanced: {
        reconnectInterval: 3000,               // Intervalle de reconnexion (ms)
        maxReconnectAttempts: 10,               // Max tentatives de reconnexion
        qrTimeout: 60000,                       // Timeout QR code (ms)
        sessionTimeout: 86400000,                // Timeout session (24h)
        usePairingCode: false,                   // Utiliser code d'appairage
    },

    // ========================================
    // MÉTHODE POUR FORMER LES MESSAGES
    // ========================================
    formatMessage: function(key, replacements = {}) {
        let message = this.messages[key] || this.messages.error;
        
        // Remplacer les variables
        replacements = {
            name: this.bot.name,
            owner: this.bot.owner,
            version: this.bot.version,
            emoji: this.bot.emoji,
            ...replacements
        };
        
        for (let [key, value] of Object.entries(replacements)) {
            message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        
        return message;
    },

    // ========================================
    // MÉTHODE POUR OBTENIR UNE COMMANDE
    // ========================================
    getCommand: function(cmdName) {
        return this.commands[cmdName.toLowerCase()] || null;
    }
};

// Exporter la configuration
module.exports = config;

// Afficher un message de bienvenue
console.log('╔══════════════════════════════════╗');
console.log('║   ELEXTERCORES BOT CONFIGURÉ    ║');
console.log('║                                  ║');
console.log(`║  Propriétaire: ${config.bot.owner}`);
console.log(`║  Bot: ${config.bot.name}`);
console.log(`║  Version: ${config.bot.version}`);
console.log('╚══════════════════════════════════╝');