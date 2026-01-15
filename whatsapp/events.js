/**
 * Gestionnaire d'événements WhatsApp
 * Toutes les conneries de messages arrivent ici
 */

const { handleMessage } = require('./handler');
const config = require('../../config/settings.json');

module.exports = function(sock) {
    console.log('Handlers chargés, putain!');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        // Anti-call
        if (msg.message?.call) {
            console.log('Appel bloqué, fils de pute!');
            return;
        }
        
        // Traiter le message
        await handleMessage(sock, msg);
    });
    
    // Anti-delete
    sock.ev.on('messages.update', (updates) => {
        updates.forEach(update => {
            if (update.update?.messageStubType === 1) {
                console.log('Message supprimé détecté!');
                // Récupérer et renvoyer le message supprimé
            }
        });
    });
    
    // Anti-view-once
    sock.ev.on('messages.upsert', ({ messages }) => {
        messages.forEach(msg => {
            if (msg.message?.viewOnceMessage) {
                console.log('View-once détecté, saloperie!');
                // Sauvegarder le contenu
            }
        });
    });
};