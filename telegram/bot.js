/**
 * ÑĞĮĻJÃ_ÑĪJ - Bot Telegram
 * Fichier : telegram/bot.js
 *
 * Fonctionnalités :
 * - Bot Telegram intégré
 * - Commande /pair <numéro>
 * - Génère et envoie le code WhatsApp à 8 caractères
 * - Gestion owner
 */

const TelegramBot = require('node-telegram-bot-api');
const botToken = '8064734295:AAGYYY8xG_i5J88qR5xSeSrbhgxid24ED34'; // Clé API Telegram
const bot = new TelegramBot(botToken, { polling: true });

// Propriétaire du bot (owner)
const OWNER_ID = 243990774206; // Remplace par ton ID Telegram

// Commande /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Bonjour ${msg.from.first_name} 👋\nJe suis ÑĞĮĻJÃ_ÑĪJ Bot Telegram.\nUtilise /pair <numéro> pour générer un code WhatsApp.`);
});

// Commande /pair <numéro>
bot.onText(/\/pair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = match[1]; // Numéro à pairer

    // Vérification si c'est l'owner
    if (msg.from.id != OWNER_ID) {
        return bot.sendMessage(chatId, "❌ Vous n'êtes pas autorisé à utiliser cette commande.");
    }

    // Génération du code de pairing fictif (8 caractères)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const message = `ÑĞĮĻJÃ_ÑĪJ :\n\n✅ Pairing Code Generated!\n\n🔢 Your Code: ${code}\n\n📋 Steps to Connect:\n1️⃣ Ouvrir WhatsApp\n2️⃣ Paramètres → Appareils liés\n3️⃣ Lier un appareil\n4️⃣ Entrer le code ci-dessus (8 caractères)\n\n⏰ Expire dans quelques minutes\n🤖 Le bot WhatsApp s'active automatiquement!`;

    bot.sendMessage(chatId, message);
});

// Gestion des erreurs
bot.on('polling_error', (error) => {
    console.error('Erreur Telegram :', error);
});

module.exports = bot;