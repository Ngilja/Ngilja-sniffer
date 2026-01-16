/**
 * ÑĞĮĻJÃ_ÑĪJ - Gestion des événements WhatsApp
 * Fichier : lib/events.js
 * 
 * Ce fichier gère :
 * - Anti-delete messages
 * - Anti view-once
 * - Anti appel
 * - Mode public / privé
 * - Logs clairs en français
 */

const fs = require('fs');
const path = require('path');

// Fonction pour attacher les événements à un client WhatsApp
async function bindEvents(client) {

    // Anti-delete
    client.ev.on('messages.update', async (update) => {
        for (const u of update) {
            if (u.update.message && u.update.messageStubType === 68) { // Suppression d'un message
                const jid = u.key.remoteJid;
                await client.sendMessage(jid, { text: '⚠️ Vous ne pouvez pas supprimer les messages dans ÑĞĮĻJÃ_ÑĪJ !' });
            }
        }
    });

    // Anti view-once
    client.ev.on('messages.upsert', async (msg) => {
        const message = msg.messages[0];
        if (!message.message) return;
        if (message.message?.viewOnceMessage) {
            const jid = message.key.remoteJid;
            const content = message.message.viewOnceMessage.message;
            await client.sendMessage(jid, { text: '📌 Contenu view-once détecté ! Voici :\n' + JSON.stringify(content) });
        }
    });

    // Anti-appel
    client.ws.on('CB:call', async (call) => {
        const caller = call.content[0].attrs['call-creator'];
        await client.sendMessage(caller, { text: '🚫 Les appels ne sont pas autorisés sur ÑĞĮĻJÃ_ÑĪJ !' });
    });

    // Logs messages reçus
    client.ev.on('messages.upsert', (msg) => {
        const message = msg.messages[0];
        if (message?.message?.conversation) {
            console.log(`[MESSAGE] ${message.key.remoteJid} : ${message.message.conversation}`);
        }
    });

    console.log('✅ Tous les événements sont attachés au client WhatsApp');
}

module.exports = { bindEvents };