/**
 * ÑĞĮĻJÃ_ÑĪJ - Gestion des événements WhatsApp
 * Fichier : whatsapp/events.js
 *
 * Gère :
 * - Anti-delete messages
 * - Anti view-once
 * - Logs clairs et lisibles
 */

const fs = require('fs');

/**
 * Fonction pour gérer les événements entrants de WhatsApp
 * @param {import('@adiwajshing/baileys').AnyWASocket} client
 * @param {Object} event
 */
async function handleEvent(client, event) {
    // Anti-Delete
    if (event.update?.type === 'message.delete') {
        const msg = event.update.message;
        const jid = event.update.key.remoteJid;
        console.log(`⚠️ Message supprimé détecté de ${jid}`);

        // Réenvoyer le message supprimé
        if (msg) {
            await client.sendMessage(jid, { text: `⚠️ Message supprimé détecté :\n${JSON.stringify(msg.message)}` });
        }
    }

    // Anti ViewOnce
    if (event.update?.type === 'message.viewOnce') {
        const msg = event.update.message;
        const jid = event.update.key.remoteJid;
        console.log(`👁️ Message ViewOnce détecté de ${jid}`);

        if (msg) {
            await client.sendMessage(jid, { text: `👁️ Message ViewOnce intercepté :\n${JSON.stringify(msg.message)}` });
        }
    }

    // Logs simples pour chaque événement
    console.log(`📌 Événement reçu : ${event.update?.type || 'inconnu'}`);
}

module.exports = { handleEvent };