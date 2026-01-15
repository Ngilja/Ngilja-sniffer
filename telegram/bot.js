/**
 * Bot Telegram pour gestion pairing
 * Putain de code à 8 caractères
 */

const TelegramBot = require('node-telegram-bot-api');
const { generatePairingCode } = require('../whatsapp/connect');
const config = require('../config/settings.json');

let telegramBot = null;

function initTelegram(token) {
    telegramBot = new TelegramBot(token, { polling: true });
    
    console.log('Bot Telegram démarré, bordel!');
    
    // Commande /pair
    telegramBot.onText(/\/pair (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const phoneNumber = match[1];
        
        // Vérifier owner
        if (msg.from.id.toString() !== config.OWNER_NUMBER) {
            return telegramBot.sendMessage(chatId, 'T\'es pas owner, va te faire foutre!');
        }
        
        try {
            const code = await generatePairingCode(phoneNumber);
            await telegramBot.sendMessage(chatId, 
                `*Code de pairing WhatsApp:* \`${code}\`\n\nRentre ce putain de code dans WhatsApp > Linked Devices`,
                { parse_mode: 'Markdown' }
            );
        } catch (err) {
            await telegramBot.sendMessage(chatId, `Erreur: ${err.message}`);
        }
    });
    
    // Commande /start
    telegramBot.onText(/\/start/, (msg) => {
        telegramBot.sendMessage(msg.chat.id, 
            `*Bot ÑĞĮĻJÃ_ÑĪJ*\n\n` +
            `Commandes:\n` +
            `/pair <numéro> - Générer code pairing\n` +
            `/status - Vérifier bot`,
            { parse_mode: 'Markdown' }
        );
    });
}

module.exports = { initTelegram };