/**
 * ÑĞĮĻJÃ_ÑĪJ - Gestion des commandes et du mode bot
 * Fichier : lib/handler.js
 *
 * Ce fichier gère :
 * - Les commandes du bot (owner & utilisateurs)
 * - Mode public / privé
 * - Réponses automatiques
 */

const fs = require('fs');
const { downloadMediaMessage } = require('@adiwajshing/baileys');
const { exec } = require('child_process');

let botMode = 'public'; // Modes possibles : 'public' ou 'private'

// Fonction pour gérer les messages entrants
async function handleMessage(client, message) {
    const msg = message.message?.conversation || message.message?.extendedTextMessage?.text;
    if (!msg) return;

    const from = message.key.remoteJid;
    const isOwner = ['243990774206@s.whatsapp.net'].includes(message.key.participant || from); // Remplace par ton numéro

    // Commandes owner
    if (msg.startsWith('!')) {
        const cmd = msg.slice(1).split(' ')[0];
        const args = msg.slice(1).split(' ').slice(1).join(' ');

        switch (cmd) {
            case 'mode':
                if (!isOwner) return;
                if (['public', 'private'].includes(args)) {
                    botMode = args;
                    await client.sendMessage(from, { text: `✅ Mode bot changé en ${botMode}` });
                } else {
                    await client.sendMessage(from, { text: '❌ Mode invalide. Utiliser public ou private.' });
                }
                break;

            case 'say':
                if (!isOwner) return;
                await client.sendMessage(from, { text: args });
                break;

            default:
                await client.sendMessage(from, { text: '❌ Commande inconnue.' });
        }
    } else {
        // Réponses automatiques
        if (botMode === 'public' || (botMode === 'private' && isOwner)) {
            if (msg.toLowerCase().includes('bonjour')) {
                await client.sendMessage(from, { text: 'Bonjour ! Je suis ÑĞĮĻJÃ_ÑĪJ 🤖' });
            }

            if (msg.toLowerCase().includes('aide')) {
                await client.sendMessage(from, { text: '📋 Commandes disponibles :\n!mode public|private\n!say <message>' });
            }
        }
    }
}

module.exports = { handleMessage, botMode };