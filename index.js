/**
 * Fichier principal du bot ÑĞĮĻJÃ_ÑĪJ
 * Connecte WhatsApp et Telegram
 * Merde, c'est le point d'entrée
 */

const fs = require('fs');
const chalk = require('chalk');
const { initWhatsApp } = require('./whatsapp/connect');
const { initTelegram } = require('./telegram/bot');

console.log(chalk.green.bold(`
╔══════════════════════════════════╗
║     BOT ÑĞĮĻJÃ_ÑĪJ DÉMARRÉ       ║
║    WhatsApp + Telegram MD        ║
╚══════════════════════════════════╝
`));

// Charger la config
const config = require('./config/settings.json');

// Démarrer WhatsApp
initWhatsApp().catch(err => {
    console.log(chalk.red('PUTAIN! Erreur WhatsApp:'), err);
});

// Démarrer Telegram
initTelegram(config.TELEGRAM_TOKEN);