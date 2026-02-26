// ============================================
// FICHIER: config.js
// BOT: NGILJA BOT
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// VERSION: 1.0.0
// ============================================

const fs = require('fs');
const path = require('path');

module.exports = {
    bot: {
        name: "Bandaheali-Mini",
        owner: "Bandaheali",
        version: "1.0.0",
        prefix: ".",
        emoji: "🥷🏻✨️",
    },
    settings: {
        autoread: true,
        autoreact: true,
        autorecord: true,
        language: "fr",
        antiSpam: true
    },
    colors: {
        primary: "#ff0055",
        secondary: "#00ff99"
    },
    paths: {
        profilePic: "public/profile.jpg", // mettre ton image ici
        media: "media/",
        audios: "audios/"
    },
    commands: {
        ping: { description: "Test de latence", category: "system" },
        alive: { description: "Vérifie si le bot est en ligne", category: "system" },
        help: { description: "Liste des commandes", category: "system" },
        pair: { description: "Génère un code de parrainage", category: "system" },
        autoread: { description: "Active/Désactive l'autoread", category: "settings" },
        autoreact: { description: "Active/Désactive l'autoreact", category: "settings" },
        autorecord: { description: "Active/Désactive l'autorecord", category: "settings" },
        // Ajoute ici toutes tes autres commandes, jusqu'à 451
    },
    getCommand: function(cmdName) {
        return this.commands[cmdName] || null;
    },
    formatMessage: function(type, data) {
        const templates = {
            notFound: `❌ Commande non trouvée: ${data.cmd}`,
            error: `❌ Erreur: ${data.error}`,
            alive: `🤖 ${data.uptime} en ligne | RAM utilisée: ${data.ram}MB`
        };
        return templates[type] || "Message par défaut";
    }
};