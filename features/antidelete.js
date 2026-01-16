/**
 * ÑĞĮĻJÃ_ÑĪJ - Anti-Delete WhatsApp
 * Fichier : features/antidelete.js
 *
 * Fonctionnalité :
 * - Empêche la suppression des messages reçus (anti-delete)
 * - Renvoie le message supprimé dans le chat
 */

const { MessageType } = require('@adiwajshing/baileys');

/**
 * Fonction anti-delete
 * @param {WAConnection} client - instance Baileys
 * @param {Object} message - message reçu
 */
async function antiDelete(client, message) {
    try {
        // Vérifier si le message est une suppression
        if (message.key && message.key.remoteJid && message.messageStubType === 68) {
            const jid = message.key.remoteJid;
            const participant = message.key.participant || message.key.remoteJid;

            // Message original avant suppression
            const deletedMsg = message.message?.ephemeralMessage?.message || message.message;

            // Envoyer le message supprimé
            await client.sendMessage(
                jid,
                `❗ Un message a été supprimé par ${participant} :\n\n${JSON.stringify(deletedMsg)}`,
                MessageType.text
            );
        }
    } catch (error) {
        console.error('Erreur Anti-Delete :', error);
    }
}

module.exports = antiDelete;