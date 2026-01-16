/**
 * ÑĞĮĻJÃ_ÑĪJ - Bot Telegram
 * Fichier : telegram/bot.js
 *
 * Fonctionnalités :
 * - Commande /pair <numéro>
 * - Générer et envoyer le code WhatsApp à 8 caractères
 * - Gestion owner
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TELEGRAM_API_KEY = '8064734295:AAGYYY8xG_i5J88qR5xSeSrbhgxid24ED34'; // Remplacer par votre clé Telegram
const OWNER_ID = 243990774206; // Numéro owner Telegram

// Créer le bot en mode polling
const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `👋 Bonjour ! Je suis le bot ÑĞĮĻJÃ_ÑĪJ\nUtilisez /pair <numéro> pour générer un code WhatsApp MD`);
});

// Commande /pair <numéro>
bot.onText(/\/pair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = match[1];

    if (msg.from.id !== OWNER_ID) {
        return bot.sendMessage(chatId, '❌ Vous n’êtes pas autorisé à utiliser cette commande.');
    }

    try {
        // Appel API externe ou interne pour générer le code WhatsApp
        // Ici on simule la génération du code de 8 caractères
        const code = generatePairingCode(); 
        bot.sendMessage(chatId, `✅ Pairing Code Généré pour ${number} !\n\n🔢 Code : ${code}\n\n📋 Étapes :\n1️⃣ Ouvrez WhatsApp\n2️⃣ Paramètres → Appareils liés\n3️⃣ "Lier avec le numéro"\n4️⃣ Entrez le code ci-dessus\n⏰ Expire dans quelques minutes`);
    } catch (error) {
        bot.sendMessage(chatId, `❌ Erreur lors de la génération du code : ${error.message}`);
    }
});

/**
 * Génère un code WhatsApp à 8 caractères alphanumériques
 * @returns {string}
 */
function generatePairingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

console.log('🤖 Bot Telegram ÑĞĮĻJÃ_ÑĪJ prêt !');

module.exports = bot;