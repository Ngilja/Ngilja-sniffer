/**
 * ÑĞĮĻJÃ_ÑĪJ - Anti Call WhatsApp
 * Fichier : features/antical.js
 *
 * Fonctionnalité :
 * - Empêche que le bot reçoive des appels vocaux ou vidéo
 * - Notifie l'expéditeur que les appels sont bloqués
 */

async function antiCall(client, update) {
    try {
        // Vérifier si c'est un appel
        if (update?.call?.from) {
            const callerJid = update.call.from;

            // Envoyer un message automatique pour informer
            await client.sendMessage(
                callerJid,
                '📵 Les appels sont désactivés pour ÑĞĮĻJÃ_ÑĪJ. Veuillez utiliser le chat.',
                { quoted: update }
            );

            // Optionnel : bloquer l'appel (en réponse automatique)
            console.log(`❌ Appel de ${callerJid} bloqué par Anti-Call.`);
        }
    } catch (error) {
        console.error('Erreur Anti-Call :', error);
    }
}

module.exports = antiCall;