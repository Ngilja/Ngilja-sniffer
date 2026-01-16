/**
 * ÑĞĮĻJÃ_ÑĪJ - Anti View-Once WhatsApp
 * Fichier : features/antiviewonce.js
 *
 * Fonctionnalité :
 * - Permet de lire les messages "view once" sans que l'expéditeur sache que le message a été vu
 * - Rend le message permanent dans le chat
 */

const { MessageType, WAMessageProto } = require('@adiwajshing/baileys');

/**
 * Fonction anti view-once
 * @param {WAConnection} client - instance Baileys
 * @param {Object} message - message reçu
 */
async function antiViewOnce(client, message) {
    try {
        // Vérifier si le message est de type "view once"
        const msg = message.message;
        if (!msg) return;

        const viewOnceMessage = msg?.viewOnceMessage;
        if (viewOnceMessage) {
            const jid = message.key.remoteJid;

            // Extraire le message original
            const originalMsg = viewOnceMessage?.message;

            // Transformer en message normal
            const normalMessage = WAMessageProto.Message.fromObject(originalMsg);

            // Envoyer à nouveau dans le chat pour que le message soit lisible
            await client.sendMessage(jid, normalMessage, {
                quoted: message,
            });

            console.log(`✅ Message "view once" intercepté pour ${jid}`);
        }
    } catch (error) {
        console.error('Erreur Anti-View-Once :', error);
    }
}

module.exports = antiViewOnce;